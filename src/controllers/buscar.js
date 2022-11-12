const { response, request } = require("express");
const { ObjectId } = require("mongoose").Types;

const { Usuario, Categoria, Producto } = require("../models");

const coleccionesPermitidas = ["usuarios", "categorias", "productos", "roles"];

const buscarUsuarios = async (termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino); // TRUE

  try {
    if (esMongoID) {
      const usuario = await Usuario.findById(termino);
      return res.json({
        results: usuario ? [usuario] : [],
      });
    }

    const regex = new RegExp(termino, "i");
    const usuarios = await Usuario.find({
      $or: [{ nombre: regex }, { correo: regex }],
      $and: [{ estado: true }],
    });

    res.json({
      results: usuarios,
    });
  } catch (err) {
    console.log("Error al buscar el usuario: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

const buscarCategorias = async (termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino); // TRUE

  try {
    if (esMongoID) {
      const categoria = await Categoria.findById(termino);
      return res.json({
        results: categoria ? [categoria] : [],
      });
    }

    const regex = new RegExp(termino, "i");
    const categorias = await Categoria.find({ nombre: regex, estado: true });

    res.json({
      results: categorias,
    });
  } catch (err) {
    console.log("Error al buscar la categoría: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

const buscarProductos = async (
  termino = "",
  lote = "",
  proveedor = "",
  res = response
) => {
  const esMongoID = ObjectId.isValid(termino); // TRUE

  try {
    if (esMongoID) {
      const producto = await Producto.findById(termino)
        .populate("categoria", "nombre")
        .populate("proveedor", "nombre");
      return res.json({
        results: producto ? [producto] : [],
      });
    }

    const regex = new RegExp(termino, "i");
    let query = {
      nombre: regex,
      estado: true,
    };

    lote
      ? (query = {
          ...query,
          lote,
        })
      : query;

    proveedor
      ? (query = {
          ...query,
          proveedor,
        })
      : query;

    const productos = await Producto.find(query).populate(
      "categoria",
      "nombre"
    );
    res.json({
      results: productos,
    });
  } catch (err) {
    console.log("Error al buscar el producto: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

const buscador = (req, res = response) => {
  const { coleccion, termino } = req.params;
  const { lote, proveedor } = req.query;

  if (!coleccionesPermitidas.includes(coleccion)) {
    return res.status(400).json({
      msg: `Las colecciones permitidas son: ${coleccionesPermitidas}`,
    });
  }

  switch (coleccion) {
    case "usuarios":
      buscarUsuarios(termino, res);
      break;
    case "categorias":
      buscarCategorias(termino, res);
      break;
    case "productos":
      buscarProductos(termino, lote, proveedor, res);
      break;

    default:
      res.status(500).json({
        msg: "Se le olvido hacer esta búsquda",
      });
  }
};

module.exports = {
  buscador,
};
