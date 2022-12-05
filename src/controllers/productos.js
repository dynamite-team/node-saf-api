const { response } = require("express");
const { Producto, Punto, Usuario } = require("../models");

const { Date } = require("../helpers/generar-lote");
const { default: mongoose } = require("mongoose");

const ctrlProductos = {};

ctrlProductos.obtenerProductosProductor = async (req, res = response) => {
  const { id } = req.params;
  const query = { estado: true, proveedor: id };
  try {
    const [total, productos] = await Promise.all([
      Producto.countDocuments(query),
      Producto.find(query),
    ]);

    res.status(200).json({
      total,
      productos,
    });
  } catch (err) {
    console.log("Error al mostrar los usuarios", err);
    res.status(500).json({
      msg: "Por favor hable con el administrador",
    });
  }
};

ctrlProductos.obtenerInventario = async (req, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  let query;

  query = {
    estado: true,
    disponible: true,
    "destino.cantidad": { $ne: 0 },
  };

  try {
    const [total, inventario, detallado] = await Promise.all([
      Producto.countDocuments(query),
      Producto.aggregate([
        { $match: query },
        {
          $unwind: "$destino",
        },
        {
          $lookup: {
            from: "categorias", //colección categoria
            localField: "categoria", //campo de relación en productos
            foreignField: "_id", //id colección categoria
            as: "categoria",
          },
        },
        {
          $unwind: "$categoria",
        },
        {
          $lookup: {
            from: "puntos",
            localField: "destino.punto",
            foreignField: "_id",
            as: "punto",
          },
        },
        {
          $unwind: "$punto",
        },
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
            from: "usuarios",
            localField: "proveedor",
            foreignField: "_id",
            as: "proveedor",
          },
        },
        {
          $unwind: "$proveedor",
        },
        {
          $project: {
            _id: 0,
            img: 1,
            lote: 1,
            nombre: 1,
            //precio: 1,
            unidad: 1,
            uid: "$_id",
            id: "$destino._id",
            cantidad: "$destino.cantidad",
            categoria: "$categoria.nombre",
            //img: "$usuario.img",
            proveedor: "$proveedor.nombre",
            punto: "$punto.nombre",
            usuario: "$usuario.nombre",
          },
        },
        { $sort: { nombre: 1 } },
        { $skip: parseInt(desde) },
        { $limit: parseInt(limite) },
      ]),
      Producto.find(query)
        .populate("usuario", "nombre")
        .populate("categoria", "nombre")
        .populate("proveedor", "nombre")
        .populate("destino.punto", "nombre")
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);

    res.json({
      total,
      inventario,
      detallado,
    });
  } catch (err) {
    console.log("Error al mostrar los productos: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlProductos.actualizarInventario = async (req, res = response) => {
  const { id } = req.params;
  const body = req.body;
};

ctrlProductos.obtenerProductos = async (req, res = response) => {
  const { limite = 5, desde = 0, punto = "" } = req.query;
  let query;
  let categorias = [];
  let lotes = [];

  punto
    ? (query = {
        estado: true,
        "destino.punto": punto,
        "destino.cantidad": { $ne: 0 },
      })
    : (query = {
        estado: true,
        "destino.cantidad": { $ne: 0 },
      });

  try {
    const [total, productos, tabla, destinos, productores, disponibles] =
      await Promise.all([
        Producto.countDocuments(query),
        Producto.find(query)
          .populate("usuario", "nombre")
          .populate("categoria", "nombre")
          .populate("proveedor", "nombre")
          .populate("destino.punto", "nombre")
          .skip(Number(desde))
          .limit(Number(limite)),
        Producto.aggregate([
          { $match: { estado: true } },
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
              from: "usuarios",
              localField: "proveedor",
              foreignField: "_id",
              as: "proveedor",
            },
          },
          { $unwind: "$proveedor" },
          {
            $project: {
              _id: 0,
              id: "$_id",
              nombre: 1,
              precio: 1,
              lote: 1,
              descripcion: 1,
              unidad: 1,
              img: 1,
              proveedor: "$proveedor.nombre",
              usuario: "$usuario.nombre",
              updatedAt: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$updatedAt",
                },
              },
            },
          },
        ]),
        Punto.find({
          estado: true,
        }),
        Usuario.find({
          estado: true,
          rol: "productor",
        }),
        Producto.aggregate([
          {
            $match: { estado: true }, // filtramos
          },
          {
            $project: { nombre: 1, _id: 0 }, // mostramos solo algunos campos
          },

          {
            $group: {
              // empezamos con la unión
              _id: "$nombre", // creamos un nuevo "_id" -> es necesario
              nombre: { $addToSet: "$nombre" }, // unimos los documentos en un arreglo sin documentos repetidos
            },
          },
          {
            $unwind: "$nombre", // separamos el arreglo por documentos
          },
          /*           {
            $project: { nombre: 1, _id: 0 }, // mostramos solo algunos campos
          }, */
        ]),
      ]);

    productos.forEach((c) => {
      if (!categorias.includes(c.categoria.nombre)) {
        categorias = [c.categoria.nombre, ...categorias];
      }
    });

    productos.forEach((c) => {
      if (!lotes.includes(c.lote)) {
        lotes = [c.lote, ...lotes];
      }
    });

    res.json({
      total,
      tabla,
      productos,
      disponibles,
      categorias,
      destinos,
      lotes,
      productores,
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
    /*    const productoDB = await Producto.findOne({
      $and: [{ nombre: body.nombre.toUpperCase() }, { lote: body.lote }],
    }); */

    /*     if (productoDB) {
      return res.status(400).json({
        msg: `El producto ${productoDB.nombre}, ya existe`,
      });
    } */

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

ctrlProductos.asignarStock = async (req, res = response) => {
  const { stock } = req.body;

  try {
    const arrPromesa = stock.map(({ uid, ...resto }) => {
      return Producto.findByIdAndUpdate(uid, resto, { new: true });
    });

    //Otra opcion allSettled, si falla me indica en donde lo hizo
    await Promise.all(arrPromesa);

    res.status(201).json({
      msg: "Stock agregado correctamente",
    });
  } catch (err) {
    console.log("Error al asignar el stock: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlProductos.borrarStock = async (req, res = response) => {
  const { uid, id } = req.params;

  try {
    const producto = await Producto.updateOne(
      { _id: uid },
      {
        $pull: {
          destino: { _id: id },
        },
      }
    );

    /*     const productoBorrado = await Producto.findById(uid);

    console.log(productoBorrado.destino[0]._id.toString(), id);

    productoBorrado.destino.filter((destino) => destino._id.toString() !== id);

    console.log(productoBorrado.destino); */

    res.json({ msg: "Borrado" });
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
