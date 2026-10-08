import { Router } from "express";
import { obtenerConfiguracion } from "../controllers/configuracion.controllers.js";

const router = Router();
router.route("/").get(obtenerConfiguracion);

export default router;