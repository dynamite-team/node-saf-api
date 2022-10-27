const { Schema, model } = require("mongoose");

const InventarioSchema = Schema(
  {
    punto: {
      type: Schema.Types.ObjectId,
      ref: "Punto",
      required: true,
    },
    estado: {
      type: Boolean,
      default: true,
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
          default: 0,
        },
      },
    ],
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  { timestamps: true }
);

InventarioSchema.methods.toJSON = function () {
  const { __v, estado, ...data } = this.toObject();
  return data;
};

module.exports = model("Inventario", CategoriaSchema);
