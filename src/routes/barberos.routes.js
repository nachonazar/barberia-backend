import { Router } from "express";
import {
  actualizarBarbero,
  crearBarbero,
  eliminarBarbero,
  listarBarberos,
  listarTodosBarberos,
} from "../controllers/barberos.controllers.js";
import {
  validarActualizarBarbero,
  validarCrearBarbero,
  validarIdBarbero,
} from "../helpers/validacionesBarberos.js";
import resultadoValidacion from "../middlewares/resultadoValidacion.js";
import { verificarJWT } from "../middlewares/verificarJWT.js";

const router = Router();

router
  .route("/")
  .get(listarBarberos)
  .post(verificarJWT, validarCrearBarbero, resultadoValidacion, crearBarbero);

// Debe ir antes de "/:id", si no Express tomaría "todos" como un id.
router.route("/todos").get(verificarJWT, listarTodosBarberos);

router
  .route("/:id")
  .put(verificarJWT, validarActualizarBarbero, resultadoValidacion, actualizarBarbero)
  .delete(verificarJWT, validarIdBarbero, resultadoValidacion, eliminarBarbero);

export default router;