import mongoose, { Schema } from "mongoose";

const servicioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [80, "El nombre no puede superar los 80 caracteres"],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      minlength: [10, "La descripción debe tener al menos 10 caracteres"],
      maxlength: [300, "La descripción no puede superar los 300 caracteres"],
      trim: true,
    },
    categoria: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    duracionMin: {
      type: Number,
      required: [true, "La duración es obligatoria"],
      min: [5, "La duración mínima es de 5 minutos"],
      max: [480, "La duración máxima es de 480 minutos"],
      validate: {
        validator: (valor) => Number.isInteger(valor) && valor % 5 === 0,
        message: "La duración debe ser un múltiplo de 5 minutos",
      },
    },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
      max: [10000000, "El precio supera el máximo permitido"],
      validate: {
        validator: Number.isInteger,
        message: "El precio debe ser un número entero (ARS)",
      },
    },
    activo: {
      type: Boolean,
      default: true,
    },
    orden: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

servicioSchema.index({ activo: 1, orden: 1 });

const Servicio = mongoose.model("servicio", servicioSchema);

export default Servicio;