import { JORNADA, ZONA_HORARIA } from "../config/negocio.js";

export const obtenerConfiguracion = (req, res) => {
  res.set("Cache-Control", "public, max-age=300");
  res.status(200).json({
    zonaHoraria: ZONA_HORARIA,
    jornada: JORNADA,
  });
};