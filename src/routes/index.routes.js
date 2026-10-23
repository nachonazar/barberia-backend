import { Router } from "express";
import saludRoutes from "./salud.routes.js";
import configuracionRoutes from "./configuracion.routes.js";
import serviciosRoutes from "./servicios.routes.js";
import barberosRoutes from "./barberos.routes.js";
import turnosRoutes from "./turnos.routes.js";
import usuariosRoutes from "./usuarios.routes.js";
import bloqueosRoutes from "./bloqueos.routes.js";

const router = Router();
router.use("/salud", saludRoutes);
router.use("/configuracion", configuracionRoutes);
router.use("/servicios", serviciosRoutes);
router.use("/barberos", barberosRoutes);
router.use("/turnos", turnosRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/bloqueos", bloqueosRoutes);

export default router;