import Barbero from "../models/barbero.js";

export const listarBarberos = async (req, res) => {
  const barberos = await Barbero.find({ activo: true })
    .sort({ orden: 1, createdAt: 1 })
    .select("nombre nombreCorto rol especialidad descripcion foto destacado")
    .lean();

  res.set("Cache-Control", "public, max-age=60");
  res.status(200).json(barberos);
};