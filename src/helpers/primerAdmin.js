import bcrypt from "bcrypt";
import Usuario from "../models/usuario.js";

const RONDAS_BCRYPT = 12;
const PASSWORD_MIN = 8;
// bcrypt ignora todo lo que supere los 72 bytes.
const PASSWORD_MAX = 72;

// Devuelve un mensaje de error o null si la contraseña (en texto plano) es válida.
const validarComplejidadPassword = (password) => {
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres`;
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return "La contraseña debe incluir al menos una minúscula, una mayúscula y un número";
  }
  return null;
};

export const crearPrimerAdmin = async () => {
  // Garantiza que el índice único del email exista antes de insertar.
  await Usuario.init();

  if (await Usuario.exists({})) return;

  const { ADMIN_NOMBRE, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NOMBRE || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn(
      "No hay usuarios y faltan ADMIN_NOMBRE, ADMIN_EMAIL o ADMIN_PASSWORD en el entorno: no se creó el administrador inicial",
    );
    return;
  }

  const errorPassword = validarComplejidadPassword(ADMIN_PASSWORD);
  if (errorPassword) {
    console.error(`No se creó el administrador inicial: ${errorPassword}`);
    return;
  }

  // Valida nombre y email con las reglas del modelo, sin lanzar excepción.
  const errorModelo = new Usuario({
    nombreAdmin: ADMIN_NOMBRE,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  }).validateSync();

  if (errorModelo) {
    const detalle = Object.values(errorModelo.errors)
      .filter((e) => e.path !== "password")
      .map((e) => e.message)
      .join(", ");
    console.error(`No se creó el administrador inicial: ${detalle}`);
    return;
  }

  const passwordHasheado = await bcrypt.hash(ADMIN_PASSWORD, RONDAS_BCRYPT);

  try {
    await Usuario.create({
      nombreAdmin: ADMIN_NOMBRE,
      email: ADMIN_EMAIL,
      password: passwordHasheado,
    });
    console.log("Administrador inicial creado");
  } catch (err) {
    // E11000: otra instancia lo creó al mismo tiempo (cold starts en Vercel). No es un problema.
    if (err.code !== 11000) throw err;
  }
};