import { Router } from "express";
import { verificarSalud } from "../controllers/salud.controllers.js";

const router = Router();
router.route("/").get(verificarSalud);

export default router;