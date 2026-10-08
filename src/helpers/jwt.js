import jwt from "jsonwebtoken";

const EXPIRACION = "8h";
const ALGORITMO = "HS256";

export const generarToken = (uid) =>
  jwt.sign({ uid: String(uid) }, process.env.SECRET_JWT, {
    expiresIn: EXPIRACION,
    algorithm: ALGORITMO,
  });

// Lanza TokenExpiredError o JsonWebTokenError si el token no es válido.
// Fija el algoritmo para evitar que acepten tokens firmados con otro.
export const verificarToken = (token) =>
  jwt.verify(token, process.env.SECRET_JWT, { algorithms: [ALGORITMO] });