import { Router } from "express";
import { listarBarberos } from "../controllers/barberos.controllers.js";

const router = Router();
router.route("/").get(listarBarberos);

export default router;