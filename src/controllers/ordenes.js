const { response } = require("express");
const { Orden, Producto } = require("../models");

const ctrlOrdenes = {};

ctrlOrdenes.obtenerOrdenes = async (req, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { estado: true };

  try {
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
  } catch (err) {
    console.log("Error al mostrar las ordenes: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlOrdenes.obtenerOrden = async (req, res = response) => {
  const { id } = req.params;

  try {
    const orden = await Orden.findById(id)
      .populate("usuario", "nombre")
      .populate("punto", "nombre");

    res.json(orden);
  } catch (err) {
    console.log("Error al mostrar la orden: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlOrdenes.crearOrden = async (req, res = response) => {
  const { orden } = req.body;

  orden.usuario = req.usuario._id;

  console.log(orden);

  /*   try {
    const arrPromesa = products.map(({ uid, ...resto }) => {
      return Producto.findByIdAndUpdate(uid, resto, { new: true });
    });

    //Otra opcion allSettled, si falla me indica en donde lo hizo
    await Promise.all(arrPromesa);

    // Generar la data a guardar
    const data = {
      ...orden,
      usuario: req.usuario._id,
    };

    const nuevaOrden = new Orden(data);
    //await nuevaOrden.save();

    res.status(201).json({
      nuevaOrden,
    });
  } catch (err) {
    console.log("Error al crear la orden: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  } */
};

ctrlOrdenes.actualizarOrden = async (req, res = response) => {
  const { id } = req.params;
  const { estado, usuario, ...data } = req.body;

  try {
    data.usuario = req.usuario._id;
    const orden = await Orden.findByIdAndUpdate(id, data, { new: true });
    res.json(orden);
  } catch (err) {
    console.log("Error al actualizar las orden: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlOrdenes.borrarOrden = async (req, res = response) => {
  const { id } = req.params;

  try {
    const ordenBorrada = await Orden.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true }
    );

    res.json(ordenBorrada);
  } catch (err) {
    console.log("Error al borrar la orden: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

module.exports = ctrlOrdenes;
