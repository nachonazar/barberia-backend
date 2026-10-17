import bcrypt from "bcrypt";
import Usuario from "../models/usuario.js";
import { generarToken } from "../helpers/jwt.js";

const RONDAS_BCRYPT = 12;

// Hash falso precalculado (mismas rondas que los reales) para que el login
// tarde parecido exista o no el email. Se calcula una sola vez al cargar el módulo.
const hashFalso = bcrypt.hashSync("contraseña-falsa-para-igualar-tiempos", RONDAS_BCRYPT);

export const login = async (req, res) => {
  const { email, password } = req.body;

  const usuario = await Usuario.findOne({ email }).select(
    "nombreAdmin email password",
  );

  const passwordCorrecto = await bcrypt.compare(
    password,
    usuario ? usuario.password : hashFalso,
  );

  if (!usuario || !passwordCorrecto) {
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });
  }

  const token = generarToken(usuario._id);

  res.status(200).json({
    mensaje: "Sesión iniciada correctamente",
    token,
    nombreAdmin: usuario.nombreAdmin,
  });
};