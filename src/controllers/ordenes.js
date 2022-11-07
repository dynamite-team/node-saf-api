const { response } = require("express");
const { Orden } = require("../models");

const ctrlOrdenes = {};

ctrlOrdenes.obtenerOrdenes = async (req, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { estado: true };

  const [total, ordenes] = await Promise.all([
    Orden.countDocuments(query),
    Orden.find(query)
      .populate("usuario", "nombre")
      .populate("punto", "nombre")
      .skip(Number(desde))
      .limit(Number(limite)),
  ]);

  res.json({
    total,
    ordenes,
  });
};

ctrlOrdenes.obtenerOrden = async (req, res = response) => {
  const { id } = req.params;
  const orden = await Orden.findById(id)
    .populate("usuario", "nombre")
    .populate("punto", "nombre");

  res.json(orden);
};

ctrlOrdenes.crearOrden = async (req, res = response) => {
  const { orden } = req.body;

  console.log(orden);

  const nuevaOrden = new Orden(orden);
  await nuevaOrden.save();

  res.status(201).json({
    nuevaOrden,
  });

  // Generar la data a guardar
  /* const data = {
    ...body,
    usuario: req.usuario._id,
  }; */

  //const orden = new Orden(data);

  // Guardar DB
  //await orden.save();

  //res.status(201).json(data);
};

ctrlOrdenes.actualizarOrden = async (req, res = response) => {
  const { id } = req.params;
  const { estado, usuario, ...data } = req.body;

  data.usuario = req.usuario._id;

  const orden = await Orden.findByIdAndUpdate(id, data, { new: true });

  res.json(orden);
};

ctrlOrdenes.borrarOrden = async (req, res = response) => {
  const { id } = req.params;
  const ordenBorrada = await Orden.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );

  res.json(ordenBorrada);
};

module.exports = ctrlOrdenes;
