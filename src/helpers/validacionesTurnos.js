import { query } from "express-validator";
import { fechaValida } from "./fechas.js";

const MAX_BARBEROS = 20;

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
    if (!ids.every((id) => /^[a-f\d]{24}$/i.test(id))) {
      throw new Error("Hay un id de barbero con formato inválido");
    }
    return true;
  }),
];