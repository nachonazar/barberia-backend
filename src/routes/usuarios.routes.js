import { Router } from "express";
import { login } from "../controllers/usuarios.controllers.js";
import { validarLogin } from "../helpers/validacionesUsuarios.js";
import resultadoValidacion from "../middlewares/resultadoValidacion.js";
import { loginLimiter } from "../middlewares/limitadores.js";

const router = Router();

router
  .route("/login")
  .post(loginLimiter, validarLogin, resultadoValidacion, login);

export default router;