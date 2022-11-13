const { response } = require("express");
const { Orden, Producto } = require("../models");

const ctrlOrdenes = {};

ctrlOrdenes.stats = async (req, res = response) => {
  const date = new Date();
  const today = new Date(date.setHours(0, 0, 0, 0));
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  const last6Month = new Date(date.setMonth(date.getMonth() - 6));

  //console.log(lastMonth, "last");
  //console.log(previousMonth, "previous");

  console.log(today);

  try {
    const [seisMeses, anteriorActualMes, esteDia, estaSemana] =
      await Promise.all([
        Orden.aggregate([
          {
            /* {
            createdAt: { $gte: previousMonth },
          }, */
            $match: {
              createdAt: { $gte: last6Month },
              estado: true,
            },
          },
          {
            $project: {
              month: { $month: "$createdAt" },
              sales: "$montoTotal",
            },
          },
          {
            $group: {
              _id: "$month",
              total: { $sum: "$sales" },
            },
          },
        ]),
        Orden.aggregate([
          {
            /* {
            createdAt: { $gte: previousMonth },
          }, */
            $match: {
              createdAt: { $gte: previousMonth },
              estado: true,
            },
          },
          {
            $project: {
              month: { $month: "$createdAt" },
              sales: "$montoTotal",
              productos: 1,
            },
          },
          {
            $unwind: "$productos",
          },
          {
            $group: {
              _id: "$month",
              total: { $sum: "$sales" },
              ordenes: { $sum: 1 },
              productos: { $sum: "$productos.cantidad" },
            },
          },
        ]),
        Orden.aggregate([
          {
            /* {
            createdAt: { $gte: previousMonth },
          }, */
            $match: {
              createdAt: { $gte: today },
              estado: true,
            },
          },
          {
            $project: {
              month: { $month: "$createdAt" },
              sales: "$montoTotal",
            },
          },
          {
            $group: {
              _id: "$month",
              total: { $sum: "$sales" },
              ordenes: { $sum: 1 },
            },
          },
        ]),
        Orden.aggregate([
          {
            /* {
            createdAt: { $gte: previousMonth },
          }, */
            $match: {
              createdAt: {
                $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000),
              },
              estado: true,
            },
          },
          {
            $project: {
              month: { $month: "$createdAt" },
              sales: "$montoTotal",
            },
          },
          {
            $group: {
              _id: "$month",
              total: { $sum: "$sales" },
              ordenes: { $sum: 1 },
            },
          },
        ]),
      ]);

    res.status(200).json({ seisMeses, anteriorActualMes, esteDia, estaSemana });
  } catch (err) {
    res.status(500).json(err);
  }
};

ctrlOrdenes.obtenerOrdenes = async (req, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { estado: true };

  try {
    const [total, detallado, ordenes] = await Promise.all([
      Orden.countDocuments(query),
      Orden.find(query)
        .populate("usuario", "nombre img")
        .populate("punto", "nombre")
        .skip(Number(desde))
        .limit(Number(limite)),
      Orden.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "usuarios",
            localField: "usuario",
            foreignField: "_id",
            as: "usuario",
          },
        },
        {
          $unwind: "$usuario",
        },
        {
          $lookup: {
            from: "puntos",
            localField: "punto",
            foreignField: "_id",
            as: "punto",
          },
        },
        {
          $unwind: "$punto",
        },
        {
          $project: {
            _id: 0,
            id: "$_id",
            usuario: "$usuario.nombre",
            img: "$usuario.img",
            montoTotal: 1,
            punto: "$punto.nombre",
            createdAt: {
              $dateToString: {
                format: "%d-%m-%Y",
                date: "$createdAt",
              },
            },
          },
        },
      ]),
    ]);

    res.json({
      total,
      ordenes,
      detallado,
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
  const { cart, orden } = req.body;

  try {
    const arrPromesa = cart.map(({ uid, ...resto }) => {
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
    await nuevaOrden.save();

    res.status(201).json({
      nuevaOrden,
    });
  } catch (err) {
    console.log("Error al crear la orden: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
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
