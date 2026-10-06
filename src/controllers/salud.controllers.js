import mongoose from "mongoose";

export const verificarSalud = (req, res) => {
  const bdConectada = mongoose.connection.readyState === 1;

  res.status(bdConectada ? 200 : 503).json({
    estado: bdConectada ? "ok" : "sin conexión a la base de datos",
    bd: bdConectada ? "conectada" : "desconectada",
  });
};