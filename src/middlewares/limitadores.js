import rateLimit from "express-rate-limit";

const enProduccion = process.env.NODE_ENV === "production";

export const crearTurnoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: enProduccion ? 10 : 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    mensaje: "Demasiados intentos de reserva. Probá de nuevo en un rato.",
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: enProduccion ? 10 : 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    mensaje: "Demasiados intentos de inicio de sesión. Probá de nuevo en unos minutos.",
  },
});