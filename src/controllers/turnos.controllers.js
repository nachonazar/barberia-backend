import Turno, { ESTADOS_QUE_OCUPAN } from "../models/turno.js";
import Bloqueo from "../models/bloqueo.js";
import { JORNADA } from "../config/negocio.js";
import { parsearIdsBarberos } from "../helpers/validacionesTurnos.js";

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