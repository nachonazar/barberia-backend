import { Router } from "express";
import {
  cambiarEstadoTurno,
  crearTurno,
  listarOcupados,
  listarTurnos,
  obtenerTurno,
} from "../controllers/turnos.controllers.js";
import {
  validarCambiarEstado,
  validarCrearTurno,
  validarIdTurno,
  validarListarTurnos,
  validarOcupados,
} from "../helpers/validacionesTurnos.js";
import resultadoValidacion from "../middlewares/resultadoValidacion.js";
import { crearTurnoLimiter } from "../middlewares/limitadores.js";
import { verificarJWT } from "../middlewares/verificarJWT.js";

const router = Router();

router
  .route("/")
  .get(verificarJWT, validarListarTurnos, resultadoValidacion, listarTurnos)
  .post(crearTurnoLimiter, validarCrearTurno, resultadoValidacion, crearTurno);

// Debe ir antes de "/:id", si no Express tomaría "ocupados" como un id.
router
  .route("/ocupados")
  .get(validarOcupados, resultadoValidacion, listarOcupados);

router
  .route("/:id")
  .get(verificarJWT, validarIdTurno, resultadoValidacion, obtenerTurno);

router
  .route("/:id/estado")
  .patch(verificarJWT, validarCambiarEstado, resultadoValidacion, cambiarEstadoTurno);

export default router;