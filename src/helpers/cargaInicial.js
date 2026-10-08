import Servicio from "../models/servicio.js";

// Datos de PRUEBA para desarrollo. Solo se cargan si CARGAR_DATOS_PRUEBA=true
// y la colección está vacía. En producción esa variable no se define.
const serviciosPrueba = [
  {
    nombre: "Corte clásico",
    descripcion: "Corte a tijera o máquina, con lavado y peinado final.",
    categoria: "Cortes",
    duracionMin: 40,
    precio: 15000,
  },
  {
    nombre: "Corte degradé",
    descripcion: "Degradé a medida con terminación en navaja.",
    categoria: "Cortes",
    duracionMin: 45,
    precio: 16000,
  },
  {
    nombre: "Corte y barba",
    descripcion: "El combo completo: corte, perfilado de barba y toalla caliente.",
    categoria: "Cortes",
    duracionMin: 60,
    precio: 22000,
  },
  {
    nombre: "Perfilado de barba",
    descripcion: "Diseño y definición de contornos con navaja.",
    categoria: "Barba y afeitado",
    duracionMin: 25,
    precio: 9000,
  },
  {
    nombre: "Afeitado clásico",
    descripcion: "Afeitado con navaja, espuma artesanal y toalla caliente.",
    categoria: "Barba y afeitado",
    duracionMin: 35,
    precio: 12000,
  },
  {
    nombre: "Limpieza facial express",
    descripcion: "Limpieza e hidratación para completar tu visita.",
    categoria: "Tratamientos",
    duracionMin: 30,
    precio: 11000,
  },
].map((servicio, indice) => ({ ...servicio, orden: indice + 1 }));

export const cargarDatosPrueba = async () => {
  if (process.env.CARGAR_DATOS_PRUEBA !== "true") return;

  if ((await Servicio.estimatedDocumentCount()) === 0) {
    await Servicio.insertMany(serviciosPrueba);
    console.info("Servicios de prueba cargados");
  }
};