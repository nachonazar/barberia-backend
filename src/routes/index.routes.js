import { Router } from "express";
import saludRoutes from "./salud.routes.js";
import configuracionRoutes from "./configuracion.routes.js";
import serviciosRoutes from "./servicios.routes.js";

const router = Router();
router.use("/salud", saludRoutes);
router.use("/configuracion", configuracionRoutes);
router.use("/servicios", serviciosRoutes);

export default router;