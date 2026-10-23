import { Router } from "express";
import {
  crearBloqueo,
  eliminarBloqueo,
  listarBloqueos,
} from "../controllers/bloqueos.controllers.js";
import {
  validarCrearBloqueo,
  validarIdBloqueo,
  validarListarBloqueos,
} from "../helpers/validacionesBloqueos.js";
import resultadoValidacion from "../middlewares/resultadoValidacion.js";
import { verificarJWT } from "../middlewares/verificarJWT.js";

const router = Router();

router
  .route("/")
  .get(verificarJWT, validarListarBloqueos, resultadoValidacion, listarBloqueos)
  .post(verificarJWT, validarCrearBloqueo, resultadoValidacion, crearBloqueo);

router
  .route("/:id")
  .delete(verificarJWT, validarIdBloqueo, resultadoValidacion, eliminarBloqueo);

export default router;