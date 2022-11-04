const { Schema, model } = require("mongoose");

const CategoriaSchema = Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      unique: true,
    },
    estado: {
      type: Boolean,
      default: true,
      required: true,
    },
    img: {
      type: String,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  { timestamps: true }
);

CategoriaSchema.methods.toJSON = function () {
  const { __v, estado, ...data } = this.toObject();
  data.uid = _id;
  return data;
};

module.exports = model("Categoria", CategoriaSchema);
