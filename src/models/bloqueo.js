import mongoose, { Schema } from "mongoose";

const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
const regexHora = /^([01]\d|2[0-3]):[0-5]\d$/;

const bloqueoSchema = new Schema(
  {
    // null = bloquea a todos los barberos
    barbero: {
      type: Schema.Types.ObjectId,
      ref: "barbero",
      default: null,
    },
    fecha: {
      type: String,
      required: [true, "La fecha es obligatoria"],
      match: [regexFecha, "La fecha debe tener el formato YYYY-MM-DD"],
    },
    // Sin horaInicio ni horaFin = día completo
    horaInicio: {
      type: String,
      default: null,
      match: [regexHora, "La hora de inicio debe tener el formato HH:mm"],
      validate: {
        validator: function (valor) {
          return (valor == null) === (this.horaFin == null);
        },
        message: "Indicá hora de inicio y de fin, o ninguna (día completo)",
      },
    },
    horaFin: {
      type: String,
      default: null,
      match: [regexHora, "La hora de fin debe tener el formato HH:mm"],
      validate: {
        validator: function (valor) {
          return valor == null || valor > this.horaInicio;
        },
        message: "La hora de fin debe ser posterior a la de inicio",
      },
    },
    motivo: {
      type: String,
      default: "",
      maxlength: [120, "El motivo no puede superar los 120 caracteres"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

bloqueoSchema.index({ fecha: 1, barbero: 1 });

const Bloqueo = mongoose.model("bloqueo", bloqueoSchema);

export default Bloqueo;