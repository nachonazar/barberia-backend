import { Router } from "express";
import {
  actualizarServicio,
  crearServicio,
  eliminarServicio,
  listarServicios,
  listarTodosServicios,
} from "../controllers/servicios.controllers.js";
import {
  validarActualizarServicio,
  validarCrearServicio,
  validarIdServicio,
} from "../helpers/validacionesServicios.js";
import resultadoValidacion from "../middlewares/resultadoValidacion.js";
import { verificarJWT } from "../middlewares/verificarJWT.js";

const router = Router();

router
  .route("/")
  .get(listarServicios)
  .post(verificarJWT, validarCrearServicio, resultadoValidacion, crearServicio);

// Debe ir antes de "/:id", si no Express tomaría "todos" como un id.
router.route("/todos").get(verificarJWT, listarTodosServicios);

router
  .route("/:id")
  .put(verificarJWT, validarActualizarServicio, resultadoValidacion, actualizarServicio)
  .delete(verificarJWT, validarIdServicio, resultadoValidacion, eliminarServicio);

export default router;