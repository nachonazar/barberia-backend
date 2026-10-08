import mongoose, { Schema } from "mongoose";

const usuarioSchema = new Schema(
  {
    nombreAdmin: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [100, "El nombre no puede superar los 100 caracteres"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      minlength: [5, "El email debe tener al menos 5 caracteres"],
      maxlength: [100, "El email no puede superar los 100 caracteres"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
        "El email no tiene un formato válido",
      ],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      maxlength: [100, "La contraseña no es válida"],
      select: false,
    },
    rol: {
      type: String,
      enum: {
        values: ["admin"],
        message: "El rol no es válido",
      },
      default: "admin",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

const Usuario = mongoose.model("usuario", usuarioSchema);

export default Usuario;