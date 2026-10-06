import mongoose, { Schema } from "mongoose";

const barberoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [80, "El nombre no puede superar los 80 caracteres"],
      trim: true,
    },
    nombreCorto: {
      type: String,
      required: [true, "El nombre corto es obligatorio"],
      minlength: 2,
      maxlength: 30,
      trim: true,
    },
    rol: {
      type: String,
      required: [true, "El rol es obligatorio"],
      minlength: 3,
      maxlength: 60,
      trim: true,
    },
    especialidad: {
      type: String,
      required: [true, "La especialidad es obligatoria"],
      minlength: 3,
      maxlength: 100,
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      minlength: [10, "La descripción debe tener al menos 10 caracteres"],
      maxlength: [400, "La descripción no puede superar los 400 caracteres"],
      trim: true,
    },
    foto: {
      type: String,
      default: "",
      maxlength: 300,
      trim: true,
      validate: {
        validator: (valor) =>
          valor === "" || /^(\/|https?:\/\/)\S+\.(jpg|jpeg|png|webp)(\?\S*)?$/i.test(valor),
        message: "La foto debe ser una ruta o URL de imagen válida",
      },
    },
    destacado: {
      type: Boolean,
      default: false,
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

barberoSchema.index({ activo: 1, orden: 1 });

const Barbero = mongoose.model("barbero", barberoSchema);

export default Barbero;