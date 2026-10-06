import mongoose from "mongoose";

let conexionPromise = null;

export const conectarDB = () => {
  if (!process.env.MONGODB) {
    throw new Error("Falta la variable de entorno MONGODB");
  }

  if (!conexionPromise) {
    conexionPromise = mongoose
      .connect(process.env.MONGODB, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 10000,
      })
      .then((conexion) => {
        console.info("BD conectada");
        return conexion;
      })
      .catch((error) => {
        console.error("Error al conectar a la base de datos:", error);
        conexionPromise = null;
        throw error;
      });
  }
  return conexionPromise;
};

export default mongoose;