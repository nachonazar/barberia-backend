import { body, query } from "express-validator";
import { fechaValida, horaValida } from "./fechas.js";

const MAX_BARBEROS = 20;
const MAX_SERVICIOS = 10;
const regexObjectId = /^[a-f\d]{24}$/i;

// "id1,id2,id1" → ["id1", "id2"] (sin repetidos ni vacíos)
export const parsearIdsBarberos = (valor) => [
  ...new Set(
    String(valor)
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  ),
];

export const validarOcupados = [
  query("fecha").custom((valor) => {
    if (!fechaValida(valor)) {
      throw new Error("La fecha debe tener el formato YYYY-MM-DD y ser válida");
    }
    return true;
  }),
  query("barberos").custom((valor) => {
    if (typeof valor !== "string") {
      throw new Error("Indicá los barberos separados por coma");
    }
    const ids = parsearIdsBarberos(valor);
    if (ids.length === 0) {
      throw new Error("Indicá al menos un barbero");
    }
    if (ids.length > MAX_BARBEROS) {
      throw new Error(`Se pueden consultar hasta ${MAX_BARBEROS} barberos`);
    }
    if (!ids.every((id) => regexObjectId.test(id))) {
      throw new Error("Hay un id de barbero con formato inválido");
    }
    return true;
  }),
];

export const validarCrearTurno = [
  body("servicios").custom((valor) => {
    if (!Array.isArray(valor) || valor.length === 0) {
      throw new Error("Elegí al menos un servicio");
    }
    if (valor.length > MAX_SERVICIOS) {
      throw new Error(`Se pueden reservar hasta ${MAX_SERVICIOS} servicios`);
    }
    if (!valor.every((id) => typeof id === "string" && regexObjectId.test(id))) {
      throw new Error("Hay un servicio con formato de id inválido");
    }
    if (new Set(valor).size !== valor.length) {
      throw new Error("No se pueden repetir servicios");
    }
    return true;
  }),
  body("barbero").custom((valor) => {
    if (valor === "cualquiera") return true;
    if (typeof valor !== "string" || !regexObjectId.test(valor)) {
      throw new Error("El barbero es inválido");
    }
    return true;
  }),
  body("fecha").custom((valor) => {
    if (!fechaValida(valor)) {
      throw new Error("La fecha debe tener el formato YYYY-MM-DD y ser válida");
    }
    return true;
  }),
  body("horaInicio").custom((valor) => {
    if (!horaValida(valor)) {
      throw new Error("La hora debe tener el formato HH:mm");
    }
    return true;
  }),
  body("cliente").isObject().withMessage("Faltan los datos del cliente"),
  body("cliente.nombre")
    .isString()
    .withMessage("El nombre es obligatorio")
    .bail()
    .trim()
    .isLength({ min: 3, max: 80 })
    .withMessage("El nombre debe tener entre 3 y 80 caracteres"),
  body("cliente.telefono")
    .isString()
    .withMessage("El teléfono es obligatorio")
    .bail()
    .matches(/^549\d{10}$/)
    .withMessage("El teléfono debe ser 549 + código de área + número (10 dígitos)"),
  body("cliente.email")
    .optional({ values: "falsy" })
    .isString()
    .bail()
    .trim()
    .isEmail()
    .withMessage("El email no tiene un formato válido")
    .bail()
    .isLength({ max: 100 })
    .withMessage("El email no puede superar los 100 caracteres"),
  body("notas")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Las notas deben ser texto")
    .bail()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Las notas no pueden superar los 300 caracteres"),
  body("recordatorioWhatsapp")
    .optional()
    .isBoolean()
    .withMessage("El recordatorio de WhatsApp debe ser verdadero o falso"),
];