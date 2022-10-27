const { Schema, model } = require("mongoose");

const PuntoSchema = Schema(
  {
    nombre: {
      type: String,
    },
    departamento: {
      type: String,
    },
    barrio: {
      type: String,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    descripcion: { type: String },
    ubicacion: {
      lat: {
        type: String,
      },
      lon: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

PuntoSchema.methods.toJSON = function () {
  const { __v, estado, ...data } = this.toObject();
  return data;
};

module.exports = model("Punto", PuntoSchema);
