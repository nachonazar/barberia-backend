import { validationResult } from "express-validator";

const resultadoValidacion = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      errores: errores.array().map((error) => ({
        mensaje: error.msg,
        campo: error.path,
      })),
    });
  }

  next();
};

export default resultadoValidacion;