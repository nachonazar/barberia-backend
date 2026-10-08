import { Router } from "express";
import saludRoutes from "./salud.routes.js";
import configuracionRoutes from "./configuracion.routes.js";
import serviciosRoutes from "./servicios.routes.js";
import barberosRoutes from "./barberos.routes.js";

const router = Router();
router.use("/salud", saludRoutes);
router.use("/configuracion", configuracionRoutes);
router.use("/servicios", serviciosRoutes);
router.use("/barberos", barberosRoutes);

export default router;