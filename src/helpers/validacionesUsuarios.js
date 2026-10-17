import { body } from "express-validator";

export const validarLogin = [
  body("email")
    .isString()
    .withMessage("El email es obligatorio")
    .bail()
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .bail()
    .isLength({ max: 100 })
    .withMessage("El email no tiene un formato válido")
    .bail()
    .isEmail()
    .withMessage("El email no tiene un formato válido"),
  body("password")
    .isString()
    .withMessage("La contraseña es obligatoria")
    .bail()
    .isLength({ min: 1, max: 72 })
    .withMessage("La contraseña no es válida"),
];