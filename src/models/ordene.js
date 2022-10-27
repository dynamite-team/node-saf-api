const { Schema, model } = require("mongoose");

const OrdeneSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    productos: [
      {
        producto: {
          type: Schema.Types.ObjectId,
          ref: "Producto",
          required: true,
        },
        cantidad: {
          type: Number,
          default: 1,
        },
        precio: {
          type: Number,
        },
      },
    ],
    monto: { type: Number, required: true },
    direccion: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    estado: { type: String, default: "pendiente" },
  },
  { timestamps: true }
);

OrdeneSchema.methods.toJSON = function () {
  const { __v, _id, ...orden } = this.toObject();
  orden.uid = _id;
  return orden;
};

module.exports = model("Ordene", OrdeneSchema);
