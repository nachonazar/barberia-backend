import mongoose, { Schema } from "mongoose";

const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
const regexHora = /^([01]\d|2[0-3]):[0-5]\d$/;

export const ESTADOS_TURNO = ["confirmado", "cancelado", "completado", "ausente"];

// Estados que ocupan el horario del barbero. "cancelado" libera las franjas.
export const ESTADOS_QUE_OCUPAN = ["confirmado", "completado", "ausente"];

// Copia de los datos del servicio al momento de reservar (historial estable)
const servicioTurnoSchema = new Schema(
  {
    servicio: {
      type: Schema.Types.ObjectId,
      ref: "servicio",
      required: true,
    },
    nombre: { type: String, required: true },
    duracionMin: { type: Number, required: true },
    precio: { type: Number, required: true },
  },
  { _id: false },
);

const turnoSchema = new Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      match: [/^AT-\d{5}$/, "El código debe tener el formato AT-#####"],
    },
    servicios: {
      type: [servicioTurnoSchema],
      validate: {
        validator: (valores) => valores.length > 0,
        message: "El turno debe incluir al menos un servicio",
      },
    },
    barbero: {
      type: Schema.Types.ObjectId,
      ref: "barbero",
      required: [true, "El barbero es obligatorio"],
    },
    fecha: {
      type: String,
      required: [true, "La fecha es obligatoria"],
      match: [regexFecha, "La fecha debe tener el formato YYYY-MM-DD"],
    },
    horaInicio: {
      type: String,
      required: [true, "La hora de inicio es obligatoria"],
      match: [regexHora, "La hora de inicio debe tener el formato HH:mm"],
    },
    horaFin: {
      type: String,
      required: [true, "La hora de fin es obligatoria"],
      match: [regexHora, "La hora de fin debe tener el formato HH:mm"],
    },
    duracionMin: {
      type: Number,
      required: true,
      min: 5,
      max: 480,
    },
    precioTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    // Franjas de 5 minutos que ocupa el turno, con la fecha incluida.
    // Ej: "2026-10-07T09:30", "2026-10-07T09:35", ...
    slots: {
      type: [String],
      validate: {
        validator: (valores) => valores.length > 0,
        message: "El turno debe ocupar al menos una franja",
      },
    },
    cliente: {
      nombre: {
        type: String,
        required: [true, "El nombre es obligatorio"],
        minlength: [3, "El nombre debe tener al menos 3 caracteres"],
        maxlength: [80, "El nombre no puede superar los 80 caracteres"],
        trim: true,
      },
      telefono: {
        type: String,
        required: [true, "El teléfono es obligatorio"],
        match: [
          /^549\d{10}$/,
          "El teléfono debe tener el formato 549 + código de área + número (10 dígitos)",
        ],
      },
      email: {
        type: String,
        default: "",
        maxlength: 100,
        lowercase: true,
        trim: true,
        validate: {
          validator: (valor) =>
            valor === "" ||
            /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(
              valor,
            ),
          message: "El email no tiene un formato válido",
        },
      },
    },
    notas: {
      type: String,
      default: "",
      maxlength: [300, "Las notas no pueden superar los 300 caracteres"],
      trim: true,
    },
    recordatorioWhatsapp: {
      type: Boolean,
      default: false,
    },
    estado: {
      type: String,
      enum: ESTADOS_TURNO,
      default: "confirmado",
    },
  },
  {
    timestamps: true,
  },
);

// Anti doble reserva: un mismo barbero no puede tener dos turnos activos que
// compartan una franja. Es único sobre cada elemento del array "slots"
// (índice multikey). Al cancelar, el turno sale del índice y libera el horario.
turnoSchema.index(
  { barbero: 1, slots: 1 },
  {
    unique: true,
    name: "unico_barbero_slots",
    partialFilterExpression: { estado: { $in: ESTADOS_QUE_OCUPAN } },
  },
);

// Para /api/turnos/ocupados
turnoSchema.index({ fecha: 1, barbero: 1, estado: 1 });

// Para el listado de administración
turnoSchema.index({ fecha: -1, horaInicio: -1 });

const Turno = mongoose.model("turno", turnoSchema);

export default Turno;