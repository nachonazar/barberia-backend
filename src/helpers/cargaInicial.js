import Servicio from "../models/servicio.js";
import Barbero from "../models/barbero.js";

// Datos de PRUEBA para desarrollo. Solo se cargan si CARGAR_DATOS_PRUEBA=true
// y la colección correspondiente está vacía. En producción esa variable no se define.
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

const barberosPrueba = [
  {
    nombre: "Barbero de ejemplo 1",
    nombreCorto: "Barbero 1",
    rol: "Fundador y maestro",
    especialidad: "+12 años de trayectoria",
    descripcion:
      "Descripción de ejemplo: especialista en cortes clásicos y afeitado tradicional con toalla caliente.",
    foto: "/img/equipo-1.webp",
    destacado: true,
  },
  {
    nombre: "Barbero de ejemplo 2",
    nombreCorto: "Barbero 2",
    rol: "Senior stylist",
    especialidad: "Especialista en fades y tendencias",
    descripcion:
      "Descripción de ejemplo: texturizados, degradés y cortes modernos con tijera y navaja.",
    foto: "/img/equipo-2.webp",
    destacado: false,
  },
  {
    nombre: "Barbero de ejemplo 3",
    nombreCorto: "Barbero 3",
    rol: "Grooming specialist",
    especialidad: "Barba y cuidado dérmico",
    descripcion:
      "Descripción de ejemplo: tratamientos de hidratación y diseño de barbas de alta densidad.",
    foto: "/img/equipo-3.webp",
    destacado: false,
  },
].map((barbero, indice) => ({ ...barbero, orden: indice + 1 }));

export const cargarDatosPrueba = async () => {
  if (process.env.CARGAR_DATOS_PRUEBA !== "true") return;

  if ((await Servicio.estimatedDocumentCount()) === 0) {
    await Servicio.insertMany(serviciosPrueba);
    console.info("Servicios de prueba cargados");
  }

  if ((await Barbero.estimatedDocumentCount()) === 0) {
    await Barbero.insertMany(barberosPrueba);
    console.info("Barberos de prueba cargados");
  }
};