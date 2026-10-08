import Usuario from "../models/usuario.js";
import { verificarToken } from "../helpers/jwt.js";

export const verificarJWT = async (req, res, next) => {
  const token = req.header("x-token");

  if (!token) {
    return res
      .status(401)
      .json({ mensaje: "Falta el token de autenticación" });
  }

  let uid;
  try {
    ({ uid } = verificarToken(token));
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ mensaje: "La sesión expiró, iniciá sesión nuevamente" });
    }
    if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
      return res.status(401).json({ mensaje: "Token inválido" });
    }
    // Cualquier otro error (ej: falta SECRET_JWT) es del servidor: va al middleware central (500 genérico).
    throw err;
  }

  const usuario = await Usuario.findById(uid).select("nombreAdmin email rol");

  if (!usuario) {
    return res.status(401).json({ mensaje: "Token inválido" });
  }

  req.usuario = usuario;
  next();
};