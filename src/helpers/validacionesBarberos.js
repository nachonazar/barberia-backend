import { body, param } from "express-validator";

const regexObjectId = /^[a-f\d]{24}$/i;
// Misma regla que el modelo: ruta o URL http(s) a una imagen.
const regexFoto = /^(\/|https?:\/\/)\S+\.(jpg|jpeg|png|webp)(\?\S*)?$/i;
// "//dominio" o "/\dominio" se interpretan como URL externa, no como ruta local.
const regexRutaAmbigua = /^\/[\/\\]/;

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

// Solo acepta números JSON enteros (no strings tipo "5").
const enteroEntre = (campo, minimo, maximo, mensaje) =>
  body(campo).custom((valor) => {
    if (
      typeof valor !== "number" ||
      !Number.isInteger(valor) ||
      valor < minimo ||
      valor > maximo
    ) {
      throw new Error(mensaje);
    }
    return true;
  });

const campoBooleano = (campo, mensaje) =>
  body(campo).custom((valor) => {
    if (typeof valor !== "boolean") {
      throw new Error(mensaje);
    }
    return true;
  });

// Vacío = sin foto. Si no está vacía, tiene que ser ruta local o URL http(s) de imagen.
const campoFoto = () =>
  body("foto")
    .isString()
    .withMessage("La foto debe ser texto")
    .bail()
    .trim()
    .isLength({ max: 300 })
    .withMessage("La foto no puede superar los 300 caracteres")
    .bail()
    .custom((valor) => {
      if (valor === "") return true;
      if (!regexFoto.test(valor) || regexRutaAmbigua.test(valor)) {
        throw new Error("La foto debe ser una ruta o URL de imagen válida");
      }
      return true;
    });

// Crear: "foto", "destacado", "activo" y "orden" son opcionales (el modelo tiene defaults).
// Actualizar (PUT = reemplazo completo): todos los campos son obligatorios.
const camposBarbero = (esCreacion) => {
  const opcionalEnCreacion = (validador) =>
    esCreacion ? validador.optional() : validador;

  return [
    textoEntre(
      "nombre",
      3,
      80,
      "El nombre es obligatorio",
      "El nombre debe tener entre 3 y 80 caracteres",
    ),
    textoEntre(
      "nombreCorto",
      2,
      30,
      "El nombre corto es obligatorio",
      "El nombre corto debe tener entre 2 y 30 caracteres",
    ),
    textoEntre(
      "rol",
      3,
      60,
      "El rol es obligatorio",
      "El rol debe tener entre 3 y 60 caracteres",
    ),
    textoEntre(
      "especialidad",
      3,
      100,
      "La especialidad es obligatoria",
      "La especialidad debe tener entre 3 y 100 caracteres",
    ),
    textoEntre(
      "descripcion",
      10,
      400,
      "La descripción es obligatoria",
      "La descripción debe tener entre 10 y 400 caracteres",
    ),
    opcionalEnCreacion(campoFoto()),
    opcionalEnCreacion(
      campoBooleano("destacado", "El campo destacado debe ser verdadero o falso"),
    ),
    opcionalEnCreacion(
      campoBooleano("activo", "El campo activo debe ser verdadero o falso"),
    ),
    opcionalEnCreacion(
      enteroEntre("orden", 0, 9999, "El orden debe ser un entero entre 0 y 9999"),
    ),
  ];
};

export const validarIdBarbero = [
  param("id").custom((valor) => {
    if (typeof valor !== "string" || !regexObjectId.test(valor)) {
      throw new Error("El id del barbero no es válido");
    }
    return true;
  }),
];

export const validarCrearBarbero = camposBarbero(true);

export const validarActualizarBarbero = [
  ...validarIdBarbero,
  ...camposBarbero(false),
];