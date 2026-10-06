import mongoose, { Schema } from "mongoose";

const usuarioSchema = new Schema(
  {
    nombreAdmin: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
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
      required: true,
      maxlength: 100,
    },
    rol: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
  },
  {
    timestamps: true,
  },
);

const Usuario = mongoose.model("usuario", usuarioSchema);

export default Usuario;