import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { conectarDB } from "../db/config.js";

export default class Server {
  constructor() {
    this.app = express();

    this.app.set("trust proxy", 1);

    this.port = process.env.PORT || 3051;
    this.conectarBaseDeDatos();
    this.middlewares();
  }

  async conectarBaseDeDatos() {
    try {
      await conectarDB();
    } catch (error) {
      console.error(
        "No se pudo establecer la conexión inicial a la base de datos",
      );
    }
  }

  middlewares() {
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: false,
      }),
    );

    const origenesPermitidos = (process.env.ORIGENES_PERMITIDOS || "")
      .split(",")
      .map((origen) => origen.trim())
      .filter(Boolean);

    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || origenesPermitidos.includes(origin)) {
            return callback(null, true);
          }
          const error = new Error("No permitido por CORS");
          error.status = 403;
          callback(error);
        },
      }),
    );
    this.app.use(express.json({ limit: "10kb" }));
    this.app.use(morgan("dev"));
  }

  manejoDeErrores() {
    this.app.use((req, res, next) => {
      res.status(404).json({ mensaje: "La ruta solicitada no existe" });
    });

    this.app.use((err, req, res, next) => {
      console.error("Error capturado por el middleware central:", err);

      if (err.type === "entity.parse.failed") {
        return res.status(400).json({ mensaje: "El cuerpo de la solicitud no es un JSON válido" });
      }

      if (err.type === "entity.too.large") {
        return res.status(413).json({ mensaje: "El cuerpo de la solicitud es demasiado grande" });
      }

      if (err.name === "CastError") {
        return res.status(400).json({ mensaje: "Formato de ID inválido" });
      }

      const statusCode = err.status || 500;
      const mensaje =
        statusCode >= 500
          ? "Error interno del servidor"
          : err.message || "Error en la solicitud";

      res.status(statusCode).json({ mensaje });
    });
  }

  listen() {
    this.app.listen(this.port, () => {
      console.info(
        `El servidor se esta ejecutando en http://localhost:${this.port}`,
      );
    });
  }
}