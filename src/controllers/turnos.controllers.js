import { randomInt } from "node:crypto";
import Turno, { ESTADOS_QUE_OCUPAN } from "../models/turno.js";
import Bloqueo from "../models/bloqueo.js";
import Servicio from "../models/servicio.js";
import Barbero from "../models/barbero.js";
import { JORNADA } from "../config/negocio.js";
import {
  ahoraLocal,
  diaSemana,
  generarSlots,
  horaAMinutos,
  minutosAHora,
  sumarDias,
} from "../helpers/fechas.js";
import { parsearIdsBarberos } from "../helpers/validacionesTurnos.js";

const MENSAJE_HORARIO_TOMADO = "Ese horario ya fue tomado, elegí otro";

const error400 = (res, campo, mensaje) =>
  res.status(400).json({ errores: [{ mensaje, campo }] });

const generarCodigo = () => `AT-${randomInt(10000, 100000)}`;

const solapan = (inicioA, finA, inicioB, finB) =>
  inicioA < finB && finA > inicioB;

// Devuelve el turno creado, o null si el horario ya estaba tomado.
// Reintenta solo si chocó el código (muy improbable).
const insertarTurno = async (datos) => {
  for (let intento = 0; intento < 5; intento++) {
    try {
      return await Turno.create({ ...datos, codigo: generarCodigo() });
    } catch (error) {
      if (error.code !== 11000) throw error;
      if (error.keyPattern?.codigo) continue;
      return null;
    }
  }
  throw new Error("No se pudo generar un código de turno único");
};

export const listarOcupados = async (req, res) => {
  const { fecha } = req.query;
  const barberosIds = parsearIdsBarberos(req.query.barberos);

  const [turnos, bloqueos] = await Promise.all([
    Turno.find({
      fecha,
      barbero: { $in: barberosIds },
      estado: { $in: ESTADOS_QUE_OCUPAN },
    })
      .select("barbero horaInicio horaFin -_id")
      .lean(),
    Bloqueo.find({
      fecha,
      barbero: { $in: [...barberosIds, null] },
    })
      .select("barbero horaInicio horaFin -_id")
      .lean(),
  ]);

  // Un bloqueo de día completo cubre toda la jornada
  const inicioJornada = JORNADA.bloques[0].inicio;
  const finJornada = JORNADA.bloques[JORNADA.bloques.length - 1].fin;

  const ocupados = {};
  barberosIds.forEach((id) => {
    ocupados[id] = [];
  });

  turnos.forEach((turno) => {
    ocupados[String(turno.barbero)].push({
      horaInicio: turno.horaInicio,
      horaFin: turno.horaFin,
    });
  });

  bloqueos.forEach((bloqueo) => {
    const rango = {
      horaInicio: bloqueo.horaInicio ?? inicioJornada,
      horaFin: bloqueo.horaFin ?? finJornada,
    };
    // barbero null = bloquea a todos los consultados
    const afectados = bloqueo.barbero ? [String(bloqueo.barbero)] : barberosIds;
    afectados.forEach((id) => ocupados[id].push(rango));
  });

  Object.values(ocupados).forEach((lista) =>
    lista.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
  );

  res.set("Cache-Control", "no-store");
  res.status(200).json(ocupados);
};

export const crearTurno = async (req, res) => {
  const {
    servicios: serviciosIds,
    barbero: barberoSolicitado,
    fecha,
    horaInicio,
    cliente,
    notas,
    recordatorioWhatsapp,
  } = req.body;

  // 1. Servicios: el servidor recalcula duración y precio desde la base
  const serviciosDB = await Servicio.find({
    _id: { $in: serviciosIds },
    activo: true,
  }).lean();

  if (serviciosDB.length !== serviciosIds.length) {
    return error400(res, "servicios", "Alguno de los servicios ya no está disponible");
  }

  const serviciosOrdenados = serviciosIds.map((id) =>
    serviciosDB.find((servicio) => String(servicio._id) === id),
  );
  const duracionMin = serviciosOrdenados.reduce((suma, s) => suma + s.duracionMin, 0);
  const precioTotal = serviciosOrdenados.reduce((suma, s) => suma + s.precio, 0);

  const inicioMin = horaAMinutos(horaInicio);
  const finMin = inicioMin + duracionMin;
  const horaFin = minutosAHora(finMin);

  // 2. Día abierto y dentro de la ventana de reserva
  const ahora = ahoraLocal();

  if (!JORNADA.diasAbiertos.includes(diaSemana(fecha))) {
    return error400(res, "fecha", "La barbería está cerrada ese día");
  }
  if (fecha < ahora.fecha) {
    return error400(res, "fecha", "La fecha ya pasó");
  }
  if (fecha > sumarDias(ahora.fecha, JORNADA.diasAdelante)) {
    return error400(
      res,
      "fecha",
      `Solo se puede reservar con hasta ${JORNADA.diasAdelante} días de anticipación`,
    );
  }

  // 3. Anticipación mínima (solo aplica si el turno es hoy)
  if (fecha === ahora.fecha && inicioMin < ahora.minutos + JORNADA.anticipacionMin) {
    return error400(
      res,
      "horaInicio",
      "Ese horario ya no está disponible por falta de anticipación",
    );
  }

  // 4. Que el horario caiga en la grilla y el turno entre completo en un bloque
  const entraEnGrilla = JORNADA.bloques.some((bloque) => {
    const inicioBloque = horaAMinutos(bloque.inicio);
    const finBloque = horaAMinutos(bloque.fin);
    return (
      inicioMin >= inicioBloque &&
      finMin <= finBloque &&
      (inicioMin - inicioBloque) % JORNADA.intervaloMin === 0
    );
  });

  if (!entraEnGrilla) {
    return error400(res, "horaInicio", "El horario elegido no es válido para la duración del turno");
  }

  // 5. Barbero(s) candidato(s), en el orden definido en el panel
  let candidatos;
  if (barberoSolicitado === "cualquiera") {
    candidatos = await Barbero.find({ activo: true })
      .sort({ orden: 1, createdAt: 1 })
      .lean();
  } else {
    const barbero = await Barbero.findOne({
      _id: barberoSolicitado,
      activo: true,
    }).lean();
    candidatos = barbero ? [barbero] : [];
  }

  if (candidatos.length === 0) {
    return error400(res, "barbero", "El barbero elegido no está disponible");
  }

  // 6. Bloqueos de ese día (del barbero o de todos)
  const bloqueos = await Bloqueo.find({
    fecha,
    barbero: { $in: [...candidatos.map((c) => c._id), null] },
  }).lean();

  const estaBloqueado = (barberoId) =>
    bloqueos.some((bloqueo) => {
      if (bloqueo.barbero && String(bloqueo.barbero) !== String(barberoId)) {
        return false;
      }
      const inicioBloqueo = bloqueo.horaInicio ? horaAMinutos(bloqueo.horaInicio) : 0;
      const finBloqueo = bloqueo.horaFin ? horaAMinutos(bloqueo.horaFin) : 24 * 60;
      return solapan(inicioMin, finMin, inicioBloqueo, finBloqueo);
    });

  const libres = candidatos.filter((barbero) => !estaBloqueado(barbero._id));

  // 7. Insertar: el índice único decide quién se queda con las franjas
  const slots = generarSlots(fecha, inicioMin, finMin);

  for (const barbero of libres) {
    const turno = await insertarTurno({
      servicios: serviciosOrdenados.map((s) => ({
        servicio: s._id,
        nombre: s.nombre,
        duracionMin: s.duracionMin,
        precio: s.precio,
      })),
      barbero: barbero._id,
      fecha,
      horaInicio,
      horaFin,
      duracionMin,
      precioTotal,
      slots,
      cliente: {
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email || "",
      },
      notas: notas || "",
      recordatorioWhatsapp: Boolean(recordatorioWhatsapp),
    });

    if (!turno) continue; // otra reserva se llevó ese barbero: probar con el siguiente

    return res.status(201).json({
      turno: {
        _id: turno._id,
        codigo: turno.codigo,
        estado: turno.estado,
        servicios: serviciosIds,
        barbero: String(barbero._id),
        fecha: turno.fecha,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin,
        duracionMin: turno.duracionMin,
        precioTotal: turno.precioTotal,
        cliente: turno.cliente,
        notas: turno.notas,
        recordatorioWhatsapp: turno.recordatorioWhatsapp,
      },
      serviciosDetalle: serviciosOrdenados.map((s) => ({
        _id: s._id,
        nombre: s.nombre,
        descripcion: s.descripcion,
        categoria: s.categoria,
        duracionMin: s.duracionMin,
        precio: s.precio,
      })),
      barberoDetalle: {
        _id: barbero._id,
        nombre: barbero.nombre,
        nombreCorto: barbero.nombreCorto,
        rol: barbero.rol,
        especialidad: barbero.especialidad,
        descripcion: barbero.descripcion,
        foto: barbero.foto,
        destacado: barbero.destacado,
      },
    });
  }

  return res.status(409).json({
    mensaje: MENSAJE_HORARIO_TOMADO,
    codigo: "HORARIO_OCUPADO",
  });
};