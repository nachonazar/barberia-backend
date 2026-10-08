import { Router } from "express";
import { listarServicios } from "../controllers/servicios.controllers.js";

const router = Router();
router.route("/").get(listarServicios);

export default router;