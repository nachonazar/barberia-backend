import { Router } from "express";
import { crearTurno, listarOcupados } from "../controllers/turnos.controllers.js";
import {
  validarCrearTurno,
  validarOcupados,
} from "../helpers/validacionesTurnos.js";
import resultadoValidacion from "../middlewares/resultadoValidacion.js";
import { crearTurnoLimiter } from "../middlewares/limitadores.js";

const router = Router();

router.route("/").post(crearTurnoLimiter, validarCrearTurno, resultadoValidacion, crearTurno);

router
  .route("/ocupados")
  .get(validarOcupados, resultadoValidacion, listarOcupados);

export default router;