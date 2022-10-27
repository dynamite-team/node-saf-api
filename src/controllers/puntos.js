const { response } = require("express");
const { Punto } = require("../models");

const ctrlPuntos = {};

ctrlPuntos.obtenerPuntos = async (req, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { estado: true };

  const [total, puntos] = await Promise.all([
    Punto.countDocuments(query),
    Punto.find(query)
      .populate("usuario", "nombre")
      .skip(Number(desde))
      .limit(Number(limite)),
  ]);

  res.json({
    total,
    puntos,
  });
};

ctrlPuntos.obtenerPunto = async (req, res = response) => {
  const { id } = req.params;
  const categoria = await Categoria.findById(id).populate("usuario", "nombre");

  res.json(categoria);
};

ctrlPuntos.crearPunto = async (req, res = response) => {
  const nombre = req.body.nombre.toUpperCase();

  const puntoDB = await Punto.findOne({ nombre });

  if (puntoDB) {
    return res.status(400).json({
      msg: `El punto ${puntoDB.nombre}, ya existe`,
    });
  }

  // Generar la data a guardar
  const data = {
    ...req.body,
    usuario: req.usuario._id,
  };

  const punto = new Punto(data);

  // Guardar DB
  await punto.save();

  res.status(201).json(punto);
};

ctrlPuntos.actualizarPunto = async (req, res = response) => {
  const { id } = req.params;
  const { estado, usuario, ...data } = req.body;

  data.nombre = data.nombre.toUpperCase();
  data.usuario = req.usuario._id;

  const punto = await Punto.findByIdAndUpdate(id, data, { new: true });

  res.json(punto);
};

ctrlPuntos.borrarPunto = async (req, res = response) => {
  const { id } = req.params;
  const puntoBorrado = await Punto.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );

  res.json(puntoBorrado);
};

module.exports = ctrlPuntos;
