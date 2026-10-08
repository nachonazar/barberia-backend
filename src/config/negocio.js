// Reglas de la jornada. El servidor es la fuente de verdad: el frontend las
// obtiene con GET /api/configuracion y no las duplica.

export const ZONA_HORARIA = "America/Argentina/Tucuman";

// Tucumán es UTC-3 todo el año (sin horario de verano)
export const OFFSET_MINUTOS = -180;

// Tamaño de las franjas con las que se controla la doble reserva.
// Todas las duraciones de servicios deben ser múltiplos de este valor.
export const FRANJA_MIN = 5;

export const JORNADA = {
  // 0 = domingo, 1 = lunes ... 6 = sábado (igual que Date#getDay)
  diasAbiertos: [1, 2, 3, 4, 5, 6],
  bloques: [
    { id: "manana", nombre: "Mañana", inicio: "09:30", fin: "13:00" },
    { id: "tarde", nombre: "Tarde", inicio: "15:00", fin: "20:30" },
  ],
  intervaloMin: 30,
  anticipacionMin: 60,
  diasAdelante: 30,
};