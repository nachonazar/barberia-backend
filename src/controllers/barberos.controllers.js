import { matchedData } from "express-validator";
import Barbero from "../models/barbero.js";
import Turno from "../models/turno.js";
import { ahoraLocal, minutosAHora } from "../helpers/fechas.js";

export const listarBarberos = async (req, res) => {
  const barberos = await Barbero.find({ activo: true })
    .sort({ orden: 1, createdAt: 1 })
    .select("nombre nombreCorto rol especialidad descripcion foto destacado")
    .lean();

  res.set("Cache-Control", "public, max-age=60");
  res.status(200).json(barberos);
};

// Turnos confirmados que todavía no terminaron: de mañana en adelante, o de hoy
// con hora de fin posterior a la hora actual.
const turnosPendientesDelBarbero = (barberoId) => {
  const ahora = ahoraLocal();

  return Turno.find({
    barbero: barberoId,
    estado: "confirmado",
    $or: [
      { fecha: { $gt: ahora.fecha } },
      { fecha: ahora.fecha, horaFin: { $gt: minutosAHora(ahora.minutos) } },
    ],
  })
    .sort({ fecha: 1, horaInicio: 1 })
    .select("codigo fecha horaInicio horaFin cliente.nombre cliente.telefono")
    .lean();
};

const respuestaBarberoConTurnos = (res, turnos) =>
  res.status(409).json({
    mensaje:
      "No se puede dar de baja al barbero: tiene turnos confirmados pendientes. Cancelalos o completalos primero",
    codigo: "BARBERO_CON_TURNOS",
    turnos,
  });

export const listarTodosBarberos = async (req, res) => {
  const barberos = await Barbero.find()
    .sort({ orden: 1, createdAt: 1 })
    .select("-__v")
    .lean();

  res.set("Cache-Control", "no-store");
  res.status(200).json(barberos);
};

export const crearBarbero = async (req, res) => {
  // Solo los campos validados: cualquier otro campo del body se descarta.
  const datos = matchedData(req, { locations: ["body"] });

  const barbero = await Barbero.create(datos);
  const { __v, ...barberoCreado } = barbero.toObject();

  res.status(201).json(barberoCreado);
};

export const actualizarBarbero = async (req, res) => {
  const { id, ...datos } = matchedData(req, { locations: ["body", "params"] });

  // Desactivar por PUT es lo mismo que dar de baja: mismo control.
  if (datos.activo === false) {
    const turnos = await turnosPendientesDelBarbero(id);
    if (turnos.length > 0) {
      return respuestaBarberoConTurnos(res, turnos);
    }
  }

  const barbero = await Barbero.findByIdAndUpdate(
    id,
    { $set: datos },
    { new: true, runValidators: true },
  )
    .select("-__v")
    .lean();

  if (!barbero) {
    return res.status(404).json({ mensaje: "El barbero no existe" });
  }

  res.status(200).json({ mensaje: "Barbero actualizado", barbero });
};

export const eliminarBarbero = async (req, res) => {
  const { id } = req.params;

  const turnos = await turnosPendientesDelBarbero(id);
  if (turnos.length > 0) {
    return respuestaBarberoConTurnos(res, turnos);
  }

  // Baja lógica e idempotente: si ya estaba inactivo, responde 200 igual.
  const barbero = await Barbero.findByIdAndUpdate(
    id,
    { $set: { activo: false } },
    { new: true },
  )
    .select("-__v")
    .lean();

  if (!barbero) {
    return res.status(404).json({ mensaje: "El barbero no existe" });
  }

  res.status(200).json({ mensaje: "Barbero dado de baja", barbero });
};