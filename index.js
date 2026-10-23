import Server from "./server/config.js";
import router from "./src/routes/index.routes.js";
import { conectarDB } from "./db/config.js";
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

const server = new Server();

// Middleware para conectar a la BD de forma segura antes de ejecutar las rutas de la API
server.app.use("/api", async (req, res, next) => {
  try {
    await conectarDB();
    next();
  } catch (error) {
    console.error("Error de conexión en middleware:", error);
    return res.status(503).json({ mensaje: "Error de conexión a la base de datos" });
  }
});

server.app.use("/api", router);

server.manejoDeErrores();

// Solo ejecuta listen localmente (Vercel no usa listen)
if (process.env.NODE_ENV !== 'production') {
  server.listen();
}

export default server.app;