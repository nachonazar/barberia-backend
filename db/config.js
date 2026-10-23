import mongoose from "mongoose";

let conexionPromise = null;

export const conectarDB = async () => {
  const mongoUri = process.env.MONGODB || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Falta la variable de entorno MONGODB o MONGODB_URI");
  }

  // Si ya hay una conexión activa, la reutiliza
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!conexionPromise) {
    conexionPromise = mongoose
      .connect(mongoUri, {
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