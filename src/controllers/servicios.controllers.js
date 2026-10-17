import { matchedData } from "express-validator";
import Servicio from "../models/servicio.js";

export const listarServicios = async (req, res) => {
  const servicios = await Servicio.find({ activo: true })
    .sort({ orden: 1, createdAt: 1 })
    .select("nombre descripcion categoria duracionMin precio")
    .lean();

  res.set("Cache-Control", "public, max-age=60");
  res.status(200).json(servicios);
};

export const listarTodosServicios = async (req, res) => {
  const servicios = await Servicio.find()
    .sort({ orden: 1, createdAt: 1 })
    .select("-__v")
    .lean();

  res.set("Cache-Control", "no-store");
  res.status(200).json(servicios);
};

export const crearServicio = async (req, res) => {
  // Solo los campos validados: cualquier otro campo del body se descarta.
  const datos = matchedData(req, { locations: ["body"] });

  const servicio = await Servicio.create(datos);
  const { __v, ...servicioCreado } = servicio.toObject();

  res.status(201).json(servicioCreado);
};

export const actualizarServicio = async (req, res) => {
  const { id, ...datos } = matchedData(req, { locations: ["body", "params"] });

  const servicio = await Servicio.findByIdAndUpdate(
    id,
    { $set: datos },
    { new: true, runValidators: true },
  )
    .select("-__v")
    .lean();

  if (!servicio) {
    return res.status(404).json({ mensaje: "El servicio no existe" });
  }

  res.status(200).json({ mensaje: "Servicio actualizado", servicio });
};

export const eliminarServicio = async (req, res) => {
  // Baja lógica e idempotente: si ya estaba inactivo, responde 200 igual.
  const servicio = await Servicio.findByIdAndUpdate(
    req.params.id,
    { $set: { activo: false } },
    { new: true },
  )
    .select("-__v")
    .lean();

  if (!servicio) {
    return res.status(404).json({ mensaje: "El servicio no existe" });
  }

  res.status(200).json({ mensaje: "Servicio dado de baja", servicio });
};