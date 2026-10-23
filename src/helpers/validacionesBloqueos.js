import { body, param, query } from "express-validator";
import { ahoraLocal, fechaValida, horaAMinutos, horaValida } from "./fechas.js";

const regexObjectId = /^[a-f\d]{24}$/i;
const MAX_MOTIVO = 120;

// Los query params pueden llegar como array (?desde=a&desde=b): cada validador
// comprueba primero que el valor sea un string.
const opcional = { values: "falsy" };

const sinValor = (valor) => valor === undefined || valor === null;

export const validarListarBloqueos = [
  query("desde")
    .optional(opcional)
    .custom((valor) => {
      if (typeof valor !== "string" || !fechaValida(valor)) {
        throw new Error("La fecha 'desde' debe tener el formato YYYY-MM-DD y ser válida");
      }
      return true;
    }),
  query("hasta")
    .optional(opcional)
    .custom((valor, { req }) => {
      if (typeof valor !== "string" || !fechaValida(valor)) {
        throw new Error("La fecha 'hasta' debe tener el formato YYYY-MM-DD y ser válida");
      }
      const desde = req.query.desde;
      if (typeof desde === "string" && fechaValida(desde) && desde > valor) {
        throw new Error("La fecha 'desde' no puede ser posterior a 'hasta'");
      }
      return true;
    }),
];

export const validarIdBloqueo = [
  param("id").custom((valor) => {
    if (typeof valor !== "string" || !regexObjectId.test(valor)) {
      throw new Error("El id del bloqueo no es válido");
    }
    return true;
  }),
];

export const validarCrearBloqueo = [
  // null = todos los barberos. La clave tiene que venir explícita.
  body("barbero").custom((valor) => {
    if (valor === null) return true;
    if (typeof valor !== "string" || !regexObjectId.test(valor)) {
      throw new Error("El barbero debe ser un id válido o null (todos los barberos)");
    }
    return true;
  }),
  body("fecha").custom((valor) => {
    if (!fechaValida(valor)) {
      throw new Error("La fecha debe tener el formato YYYY-MM-DD y ser válida");
    }
    if (valor < ahoraLocal().fecha) {
      throw new Error("La fecha ya pasó");
    }
    return true;
  }),
  // Sin horaInicio ni horaFin (omitidas o null) = día completo.
  body("horaInicio").custom((valor, { req }) => {
    if (sinValor(valor)) {
      if (!sinValor(req.body?.horaFin)) {
        throw new Error("Indicá la hora de inicio o quitá la hora de fin (día completo)");
      }
      return true;
    }
    if (!horaValida(valor)) {
      throw new Error("La hora de inicio debe tener el formato HH:mm");
    }
    return true;
  }),
  body("horaFin").custom((valor, { req }) => {
    const inicio = req.body?.horaInicio;
    if (sinValor(valor)) {
      if (!sinValor(inicio)) {
        throw new Error("Indicá la hora de fin o quitá la hora de inicio (día completo)");
      }
      return true;
    }
    if (!horaValida(valor)) {
      throw new Error("La hora de fin debe tener el formato HH:mm");
    }
    if (horaValida(inicio) && horaAMinutos(valor) <= horaAMinutos(inicio)) {
      throw new Error("La hora de fin debe ser posterior a la de inicio");
    }
    return true;
  }),
  body("motivo")
    .optional(opcional)
    .isString()
    .withMessage("El motivo debe ser texto")
    .bail()
    .trim()
    .isLength({ max: MAX_MOTIVO })
    .withMessage(`El motivo no puede superar los ${MAX_MOTIVO} caracteres`),
];