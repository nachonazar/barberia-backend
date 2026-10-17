import { body, param } from "express-validator";

const regexObjectId = /^[a-f\d]{24}$/i;

// Los strings se chequean por tipo antes de recortar y medir, así un objeto o
// un array en el body no llega nunca al controlador.
const textoEntre = (campo, minimo, maximo, mensajeObligatorio, mensajeLargo) =>
  body(campo)
    .isString()
    .withMessage(mensajeObligatorio)
    .bail()
    .trim()
    .isLength({ min: minimo, max: maximo })
    .withMessage(mensajeLargo);

// Solo acepta números JSON enteros (no strings tipo "30").
const enteroEntre = (campo, minimo, maximo, mensaje, multiploDe = 1) =>
  body(campo).custom((valor) => {
    if (
      typeof valor !== "number" ||
      !Number.isInteger(valor) ||
      valor < minimo ||
      valor > maximo ||
      valor % multiploDe !== 0
    ) {
      throw new Error(mensaje);
    }
    return true;
  });

const campoActivo = () =>
  body("activo").custom((valor) => {
    if (typeof valor !== "boolean") {
      throw new Error("El campo activo debe ser verdadero o falso");
    }
    return true;
  });

// Crear: "activo" y "orden" son opcionales (el modelo tiene defaults).
// Actualizar (PUT = reemplazo completo): todos los campos son obligatorios.
const camposServicio = (esCreacion) => {
  const orden = enteroEntre(
    "orden",
    0,
    9999,
    "El orden debe ser un entero entre 0 y 9999",
  );
  const activo = campoActivo();

  return [
    textoEntre(
      "nombre",
      3,
      80,
      "El nombre es obligatorio",
      "El nombre debe tener entre 3 y 80 caracteres",
    ),
    textoEntre(
      "descripcion",
      10,
      300,
      "La descripción es obligatoria",
      "La descripción debe tener entre 10 y 300 caracteres",
    ),
    textoEntre(
      "categoria",
      2,
      50,
      "La categoría es obligatoria",
      "La categoría debe tener entre 2 y 50 caracteres",
    ),
    enteroEntre(
      "duracionMin",
      5,
      480,
      "La duración debe ser un entero múltiplo de 5, entre 5 y 480 minutos",
      5,
    ),
    enteroEntre(
      "precio",
      0,
      10000000,
      "El precio debe ser un entero entre 0 y 10000000 (ARS)",
    ),
    esCreacion ? orden.optional() : orden,
    esCreacion ? activo.optional() : activo,
  ];
};

export const validarIdServicio = [
  param("id").custom((valor) => {
    if (typeof valor !== "string" || !regexObjectId.test(valor)) {
      throw new Error("El id del servicio no es válido");
    }
    return true;
  }),
];

export const validarCrearServicio = camposServicio(true);

export const validarActualizarServicio = [
  ...validarIdServicio,
  ...camposServicio(false),
];