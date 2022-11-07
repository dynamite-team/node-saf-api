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
        monto: {
          type: Number,
        },
      },
    ],
    montoTotal: { type: Number, required: true },
    punto: {
      type: Schema.Types.ObjectId,
      ref: "Punto",
      required: true,
    },
    estado: { type: Boolean, default: true },
  },
  { timestamps: true }
);

OrdeneSchema.methods.toJSON = function () {
  const { __v, _id, ...orden } = this.toObject();
  orden.uid = _id;
  return orden;
};

module.exports = model("Ordene", OrdeneSchema);
