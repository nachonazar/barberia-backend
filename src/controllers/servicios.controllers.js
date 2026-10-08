import Servicio from "../models/servicio.js";

export const listarServicios = async (req, res) => {
  const servicios = await Servicio.find({ activo: true })
    .sort({ orden: 1, createdAt: 1 })
    .select("nombre descripcion categoria duracionMin precio")
    .lean();

  res.set("Cache-Control", "public, max-age=60");
  res.status(200).json(servicios);
};