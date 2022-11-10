const { response } = require("express");
const { Producto } = require("../models");

const { Date } = require("../helpers/generar-lote");

const ctrlProductos = {};

ctrlProductos.obtenerProductos = async (req, res = response) => {
  const { limite = 5, desde = 0, punto } = req.query;
  let query;
  let categorias = [];

  if (punto) {
    query = {
      estado: true,
      "destino.punto": punto,
      "destino.cantidad": { $ne: 0 },
    };
  } else {
    query = {
      estado: true,
      "destino.cantidad": { $ne: 0 },
    };
  }

  try {
    const [total, productos] = await Promise.all([
      Producto.countDocuments(query),
      Producto.find(query)
        .populate("usuario", "nombre")
        .populate("categoria", "nombre")
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);

    productos.forEach((c) => {
      if (!categorias.includes(c.categoria.nombre)) {
        categorias = [c.categoria.nombre, ...categorias];
      }
    });

    res.json({
      total,
      productos,
      categorias,
    });
  } catch (err) {
    console.log("Error al mostrar los productos: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlProductos.obtenerProducto = async (req, res = response) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findById(id)
      .populate("usuario", "nombre")
      .populate("categoria", "nombre");

    res.json(producto);
  } catch (err) {
    console.log("Error al mostrar el producto: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlProductos.crearProducto = async (req, res = response) => {
  const { estado, usuario, ...body } = req.body;

  if (!body.lote) {
    let date = new Date();
    body.lote = date.yyyymmdd();
  }

  try {
    const productoDB = await Producto.findOne({
      $and: [{ nombre: body.nombre.toUpperCase() }, { lote: body.lote }],
    });

    if (productoDB) {
      return res.status(400).json({
        msg: `El producto ${productoDB.nombre}, ya existe`,
      });
    }

    // Generar la data a guardar
    const data = {
      ...body,
      nombre: body.nombre.toUpperCase(),
      usuario: req.usuario._id,
    };

    const producto = new Producto(data);

    // Guardar DB
    await producto.save();

    res.status(201).json(data);
  } catch (err) {
    console.log("Error al crear el producto: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlProductos.actualizarProducto = async (req, res = response) => {
  const { id } = req.params;
  const { estado, usuario, ...data } = req.body;

  if (data.nombre) {
    data.nombre = data.nombre.toUpperCase();
  }
  data.usuario = req.usuario._id;

  try {
    const producto = await Producto.findByIdAndUpdate(id, data, { new: true });

    res.json(producto);
  } catch (err) {
    console.log("Error al * el producto: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlProductos.borrarProducto = async (req, res = response) => {
  const { id } = req.params;

  try {
    const productoBorrado = await Producto.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true }
    );

    res.json(productoBorrado);
  } catch (err) {
    console.log("Error al * el producto: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

module.exports = ctrlProductos;
