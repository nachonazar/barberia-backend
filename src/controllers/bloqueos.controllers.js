import { matchedData } from "express-validator";
import Bloqueo from "../models/bloqueo.js";
import Barbero from "../models/barbero.js";
import Turno from "../models/turno.js";
import { ahoraLocal, minutosAHora } from "../helpers/fechas.js";

const POPULATE_BARBERO = "nombre nombreCorto";

// Turnos confirmados que se pisan con el rango del bloqueo. Si el bloqueo es de
// un barbero, solo los de ese barbero; si es de todos, los de cualquiera.
// Un día completo (sin horas) cubre todo el día. Si el bloqueo es hoy, los turnos
// que ya terminaron no cuentan (quedan sin marcar como completados).
const turnosEnConflicto = ({ barbero, fecha, horaInicio, horaFin }) => {
  const ahora = ahoraLocal();
  const condiciones = [];

  if (horaInicio) {
    condiciones.push(
      { horaInicio: { $lt: horaFin } },
      { horaFin: { $gt: horaInicio } },
    );
  }
  if (fecha === ahora.fecha) {
    condiciones.push({ horaFin: { $gt: minutosAHora(ahora.minutos) } });
  }

  const filtro = { fecha, estado: "confirmado" };
  if (barbero) filtro.barbero = barbero;
  if (condiciones.length > 0) filtro.$and = condiciones;

  return Turno.find(filtro)
    .sort({ horaInicio: 1 })
    .select(
      "codigo fecha horaInicio horaFin barbero cliente.nombre cliente.telefono",
    )
    .populate("barbero", POPULATE_BARBERO)
    .lean();
};

export const listarBloqueos = async (req, res) => {
  const { desde = ahoraLocal().fecha, hasta } = matchedData(req, {
    locations: ["query"],
  });

  const filtro = { fecha: { $gte: desde } };
  if (hasta) filtro.fecha.$lte = hasta;

  const bloqueos = await Bloqueo.find(filtro)
    .sort({ fecha: 1, horaInicio: 1, _id: 1 })
    .select("-__v")
    .populate("barbero", POPULATE_BARBERO)
    .lean();

  res.set("Cache-Control", "no-store");
  res.status(200).json(bloqueos);
};

export const crearBloqueo = async (req, res) => {
  // Solo los campos validados. Lo que no venga queda en su valor por defecto.
  const datos = matchedData(req, { locations: ["body"] });
  const {
    barbero = null,
    fecha,
    horaInicio = null,
    horaFin = null,
    motivo = "",
  } = datos;

  if (barbero) {
    const existe = await Barbero.exists({ _id: barbero });
    if (!existe) {
      return res.status(400).json({
        errores: [{ mensaje: "El barbero no existe", campo: "barbero" }],
      });
    }
  }

  const turnos = await turnosEnConflicto({
    barbero,
    fecha,
    horaInicio,
    horaFin,
  });
  if (turnos.length > 0) {
    return res.status(409).json({
      mensaje:
        "No se puede crear el bloqueo: hay turnos confirmados en ese horario. Cancelalos o completalos primero",
      codigo: "TURNOS_EN_BLOQUEO",
      turnos,
    });
  }

  const bloqueo = await Bloqueo.create({
    barbero,
    fecha,
    horaInicio,
    horaFin,
    motivo,
  });
  await bloqueo.populate("barbero", POPULATE_BARBERO);
  const { __v, ...bloqueoCreado } = bloqueo.toObject();

  res.status(201).json(bloqueoCreado);
};

export const eliminarBloqueo = async (req, res) => {
  // Borrado físico: un bloqueo no es historial.
  const bloqueo = await Bloqueo.findByIdAndDelete(req.params.id).lean();

  if (!bloqueo) {
    return res.status(404).json({ mensaje: "El bloqueo no existe" });
  }

  res.status(200).json({ mensaje: "Bloqueo eliminado" });
};
