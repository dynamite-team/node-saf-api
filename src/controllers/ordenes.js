const { response } = require("express");
const { default: mongoose } = require("mongoose");
const { Orden, Producto } = require("../models");

const ctrlOrdenes = {};

// This script is released to the public domain and may be used, modified and
// distributed without restrictions. Attribution not necessary but appreciated.
// Source: https://weeknumber.com/how-to/javascript

// Returns the ISO week of the date.
Date.prototype.getWeek = function () {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
};

// Returns the four-digit year corresponding to the ISO week of the date.
Date.prototype.getWeekYear = function () {
  var date = new Date(this.getTime());
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  return date.getFullYear();
};

const startOfMonth = (date, value = 0) => {
  return new Date(date.getFullYear(), date.getMonth() - value, 1);
};

const lastMonthAndActualDay = (date) => {
  return new Date(date.setMonth(date.getMonth() - 1));
};

const lastMonth = (date) => {
  return date.getMonth() === 0 ? 12 : date.getMonth();
};

const actualMonth = (date) => {
  return date.getMonth() + 1;
};

const startOfToday = (date) => {
  return new Date(date.setHours(0, 0, 0, 0));
};

ctrlOrdenes.stats = async (req, res = response) => {
  const date = new Date();
  console.log(date);
  const today = new Date(date.setHours(0, 0, 0, 0));
  console.log(today);
  //const lastMonth = new Date(today.setMonth(date.getMonth() - 1));
  //console.log("ultimo mes", lastMonth);
  //const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  //console.log("mes anterior", previousMonth);
  //const last6Month = new Date(date.setMonth(date.getMonth() - 6));
  //console.log("ultimos 6 meses", last6Month);

  console.log(startOfMonth(new Date(), 1), "mes anterior");
  console.log(lastMonthAndActualDay(new Date()), "mes anterior con dia actual");
  console.log(lastMonth(new Date()));
  console.log(new Date(), "Dia actual");

  try {
    const [
      comparacionSeisUltimosMeses,
      comparacionMesAnteriorActual,
      productosMesAnteriorActual,
      gananciaMesAnterior,
      ganaciaSemana,
      ganaciaDia,
      productoMasVendidoMes,
    ] = await Promise.all([
      Orden.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth(new Date(), 6) },
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
        {
          $sort: { _id: 1 },
        },
      ]),
      Orden.aggregate([
        /* {
          $project: {
            montoTotal: 1,
            createdAtWeek: {
              $isoWeek: { date: "$createdAt", timezone: "-03:00" },
            },
              createdAtMonth: {
              $month: "$createdAt",
            },
            createdAtDay: {
              $dayOfMonth: "$createdAt",
            }, 
          },
        }, */
        {
          $match: {
            estado: true,
            $or: [
              {
                $and: [
                  { createdAt: { $gte: startOfMonth(new Date(), 1) } },
                  { createdAt: { $lte: lastMonthAndActualDay(new Date()) } },
                ],
              },
              {
                createdAt: { $gte: startOfMonth(new Date()) },
              },
            ],
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
        {
          $sort: { _id: 1 },
        },
      ]),

      Orden.aggregate([
        {
          $match: {
            estado: true,
            $or: [
              {
                $and: [
                  { createdAt: { $gte: startOfMonth(new Date(), 1) } },
                  { createdAt: { $lte: lastMonthAndActualDay(new Date()) } },
                ],
              },
              {
                createdAt: { $gte: startOfMonth(new Date()) },
              },
            ],
          },
        },
        {
          $unwind: "$productos",
        },
        {
          $project: {
            month: { $month: "$createdAt" },
            productos: 1,
          },
        },
        {
          $group: {
            _id: "$month",
            productos: { $sum: "$productos.cantidad" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),

      Orden.aggregate([
        {
          $project: {
            estado: 1,
            montoTotal: 1,
            createdAt: 1,
            createdAtMonth: {
              $month: "$createdAt",
            },
          },
        },
        {
          $match: {
            createdAtMonth: lastMonth(new Date()),
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
        {
          $sort: { _id: 1 },
        },
      ]),

      Orden.aggregate([
        /* {
            $project: {
              createdAtMonth: {
                $month: "$createdAt",
              },
            },
          }, */
        {
          $project: {
            estado: 1,
            montoTotal: 1,
            createdAt: 1,
            createdAtWeek: {
              $week: "$createdAt",
            },
          },
        },
        {
          $match: {
            createdAtWeek: startOfToday(new Date()).getWeek(),
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
        {
          $sort: { _id: 1 },
        },
      ]),
      Orden.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfToday(new Date()) },
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
          $project: {
            estado: 1,

            createdAt: 1,
            productos: 1,
            createdAtMonth: {
              $month: "$createdAt",
            },
          },
        },
        {
          $match: {
            createdAtMonth: actualMonth(new Date()),
            estado: true,
          },
        },

        {
          $project: {
            productos: 1,
          },
        },
        {
          $unwind: "$productos",
        },
        {
          $lookup: {
            from: "productos",
            localField: "productos.producto",
            foreignField: "_id",
            as: "producto",
          },
        },

        {
          $project: {
            nombre: "$producto.nombre",
            cantidad: "$productos.cantidad",
            img: "$producto.img",
          },
        },
        {
          $unwind: "$nombre",
        },
        {
          $unwind: "$img",
        },
        {
          $group: {
            _id: "$_id",
            nombre: { $first: "$nombre" },
            img: { $first: "$img" },
            total: { $sum: "$cantidad" },
          },
        },
        {
          $sort: {
            total: -1,
          },
        },
      ]),
    ]);
    console.log(startOfToday(new Date()));
    res.json({
      comparacionSeisUltimosMeses,
      comparacionMesAnteriorActual,
      productosMesAnteriorActual,
      gananciaMesAnterior,
      ganaciaSemana,
      ganaciaDia,
      productoMasVendidoMes,
    });

    /*     const [seisMeses, anteriorActualMes, productoMes, esteDia, estaSemana] =
      await Promise.all([
        Orden.aggregate([
          {
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
          {
            $sort: { _id: 1 },
          },
        ]),
        Orden.aggregate([
          {
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
            $group: {
              _id: "$month",
              total: { $sum: "$sales" },
              ordenes: { $sum: 1 },
            },
          },
          {
            $sort: {
              _id: -1,
            },
          },
        ]),
        Orden.aggregate([
          {
            $match: {
              createdAt: { $gte: previousMonth },
              estado: true,
            },
          },
          {
            $project: {
              month: { $month: "$createdAt" },
              productos: 1,
            },
          },
          {
            $unwind: "$productos",
          },
          {
            $group: {
              _id: "$month",
              productos: { $sum: "$productos.cantidad" },
            },
          },
          {
            $sort: {
              _id: -1,
            },
          },
        ]),
        Orden.aggregate([
          {
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
      ]); */

    /*     res
      .status(200)
      .json({ seisMeses, anteriorActualMes, productoMes, esteDia, estaSemana }); */
  } catch (err) {
    console.log(err);
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
            usuario: "$usuario.usuario",
            nombre: "$usuario.nombre",
            apellido: "$usuario.apellido",
            img: "$usuario.img",
            montoTotal: 1,
            punto: "$punto.nombre",
            createdAt: {
              $dateToString: {
                format: "%Y-%m-%d",
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
    const orden = await Orden /* aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "usuarios",
          localField: "usuario",
          foreignField: "_id",
          as: "usuario",
        },
      },
      { $unwind: "$usuario" },
      {
        $lookup: {
          from: "productos",
          localField: "productos.producto",
          foreignField: "_id",
          as: "producto",
        },
      },
    ]); */.findById(id)
      .populate("usuario", "usuario nombre apellido img")
      .populate("productos.producto", "categoria descripcion lote unidad img")
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
