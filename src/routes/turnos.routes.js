import { Router } from "express";
import { listarOcupados } from "../controllers/turnos.controllers.js";
import { validarOcupados } from "../helpers/validacionesTurnos.js";
import resultadoValidacion from "../middlewares/resultadoValidacion.js";

const router = Router();

router
  .route("/ocupados")
  .get(validarOcupados, resultadoValidacion, listarOcupados);

export default router;