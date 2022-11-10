const { response } = require("express");
const { Categoria } = require("../models");

const ctrlCategorias = {};

ctrlCategorias.obtenerCategorias = async (req, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = {
    estado: true,
  };

  try {
    const [total, categorias] = await Promise.all([
      Categoria.countDocuments(query),
      Categoria.find(query)
        .populate("usuario", "nombre")
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);

    res.json({
      total,
      categorias,
    });
  } catch (err) {
    console.log("Error al mostrar todas las categorias: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlCategorias.obtenerCategoria = async (req, res = response) => {
  const { id } = req.params;

  try {
    const categoria = await Categoria.findById(id).populate(
      "usuario",
      "nombre"
    );

    res.json(categoria);
  } catch (err) {
    console.log("Error al mostrar la categoria: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlCategorias.crearCategoria = async (req, res = response) => {
  const nombre = req.body.nombre.toUpperCase();

  try {
    const categoriaDB = await Categoria.findOne({
      nombre,
    });

    if (categoriaDB) {
      return res.status(400).json({
        msg: `La categoria ${categoriaDB.nombre}, ya existe`,
      });
    }

    // Generar la data a guardar
    const data = {
      nombre,
      usuario: req.usuario._id,
    };

    const categoria = new Categoria(data);

    // Guardar DB
    await categoria.save();

    res.status(201).json(categoria);
  } catch (err) {
    console.log("Error al crear la categoria: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlCategorias.actualizarCategoria = async (req, res = response) => {
  const { id } = req.params;
  const { estado, usuario, ...data } = req.body;

  try {
    data.nombre = data.nombre.toUpperCase();
    data.usuario = req.usuario._id;

    const categoria = await Categoria.findByIdAndUpdate(id, data, {
      new: true,
    });

    res.json(categoria);
  } catch (err) {
    console.log("Error al actualizar la categoria: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlCategorias.borrarCategoria = async (req, res = response) => {
  const { id } = req.params;

  try {
    const categoriaBorrada = await Categoria.findByIdAndUpdate(
      id,
      {
        estado: false,
      },
      {
        new: true,
      }
    );

    res.json(categoriaBorrada);
  } catch (err) {
    console.log("Error al borrar la categoria: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

module.exports = ctrlCategorias;
