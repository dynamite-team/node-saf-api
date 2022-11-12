const { Schema, model } = require("mongoose");

const ProductoSchema = Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      /*  unique: true, */
    },
    estado: {
      type: Boolean,
      default: true,
      required: true,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    /* cantidad: {
      type: Number,
      default: 1,
    }, */
    precio: {
      type: Number,
      default: 0,
    },
    categoria: {
      type: Schema.Types.ObjectId,
      ref: "Categoria",
      required: true,
    },
    descripcion: { type: String },
    lote: {
      type: Number,
      /* type: Schema.Types.ObjectId,
      ref: "Lote",
      required: true, */
    },
    destino: [
      {
        punto: {
          type: Schema.Types.ObjectId,
          ref: "Punto",
          required: true,
        },
        cantidad: {
          type: Number,
          required: true,
        },
      },
    ],
    proveedor: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    disponible: { type: Boolean, default: false },
    img: { type: String },
  },
  { timestamps: true }
);

ProductoSchema.methods.toJSON = function () {
  const { __v, estado, _id, ...data } = this.toObject();
  data.uid = _id;
  return data;
};

module.exports = model("Producto", ProductoSchema);
