import { FRANJA_MIN, OFFSET_MINUTOS } from "../config/negocio.js";

const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
const regexHora = /^([01]\d|2[0-3]):[0-5]\d$/;

const dosDigitos = (numero) => String(numero).padStart(2, "0");

// "2026-10-07" válida de verdad (rechaza "2026-02-30")
export const fechaValida = (fecha) => {
  if (typeof fecha !== "string" || !regexFecha.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const objeto = new Date(Date.UTC(anio, mes - 1, dia));
  return (
    objeto.getUTCFullYear() === anio &&
    objeto.getUTCMonth() === mes - 1 &&
    objeto.getUTCDate() === dia
  );
};

export const horaValida = (hora) =>
  typeof hora === "string" && regexHora.test(hora);

// Fecha y hora actuales en Tucumán (el servidor de Vercel corre en UTC)
export const ahoraLocal = () => {
  const objeto = new Date(Date.now() + OFFSET_MINUTOS * 60000);
  return {
    fecha: `${objeto.getUTCFullYear()}-${dosDigitos(objeto.getUTCMonth() + 1)}-${dosDigitos(objeto.getUTCDate())}`,
    minutos: objeto.getUTCHours() * 60 + objeto.getUTCMinutes(),
  };
};

// 0 = domingo ... 6 = sábado
export const diaSemana = (fecha) => new Date(`${fecha}T00:00:00Z`).getUTCDay();

export const sumarDias = (fecha, dias) => {
  const objeto = new Date(`${fecha}T00:00:00Z`);
  objeto.setUTCDate(objeto.getUTCDate() + dias);
  return `${objeto.getUTCFullYear()}-${dosDigitos(objeto.getUTCMonth() + 1)}-${dosDigitos(objeto.getUTCDate())}`;
};

export const horaAMinutos = (hora) => {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
};

export const minutosAHora = (minutos) =>
  `${dosDigitos(Math.floor(minutos / 60))}:${dosDigitos(minutos % 60)}`;

// Franjas de FRANJA_MIN minutos entre inicio (incluido) y fin (excluido)
// Ej: generarSlots("2026-10-07", 570, 580) → ["2026-10-07T09:30", "2026-10-07T09:35"]
export const generarSlots = (fecha, inicioMin, finMin) => {
  const slots = [];
  for (let minuto = inicioMin; minuto < finMin; minuto += FRANJA_MIN) {
    slots.push(`${fecha}T${minutosAHora(minuto)}`);
  }
  return slots;
};