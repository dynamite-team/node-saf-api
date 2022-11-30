const { response, request } = require("express");
const bcryptjs = require("bcryptjs");

const Usuario = require("../models/usuario");

const ctrlUsuario = {};

ctrlUsuario.obtenerUsuarios = async (req = request, res = response) => {
  const { desde = 0, limite = 5, rol } = req.query;
  let query;
  rol ? (query = { estado: true, rol }) : (query = { estado: true });

  try {
    const [total, usuarios, tabla] = await Promise.all([
      Usuario.countDocuments(query),
      Usuario.find(query).skip(Number(desde)).limit(Number(limite)),
      Usuario.aggregate([
        { $match: { estado: true } },
        {
          $project: {
            _id: 0,
            id: "$_id",
            nombre: 1,
            correo: 1,
            rol: 1,
            img: 1,
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

    res.status(200).json({
      total,
      tabla,
      usuarios,
    });
  } catch (err) {
    console.log("Error al mostrar los usuarios", err);
    res.status(500).json({
      msg: "Por favor hable con el administrador",
    });
  }
};

ctrlUsuario.obtenerUsuario = async (req = request, res = response) => {
  const { id } = req.params;
  try {
    //Busco el usuario con dicho ID.
    const usuario = await Usuario.findById(id).populate("designado", "nombre");
    //Verifico que el usuario este activo.

    if (!usuario.estado) {
      return res.status(400).json({
        msg: `El usuario ${usuario.nombre} no existe`,
      });
    }
    res.status(200).json({
      usuario,
    });
  } catch (err) {
    console.log("Error al mostrar los datos del usuario: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlUsuario.editarUsuario = async (req, res = response) => {
  const { id } = req.params;
  const { _id, password, google, correo, ...resto } = req.body;

  if (password) {
    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    resto.password = bcryptjs.hashSync(password, salt);
  }

  try {
    const usuario = await Usuario.findByIdAndUpdate(id, resto);

    res.json(usuario);
  } catch (err) {
    console.log("Error al actualizar el usuario: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlUsuario.usuariosPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

ctrlUsuario.eliminarUsuario = async (req, res = response) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });

    res.json(usuario);
  } catch (err) {
    console.log("Error al borrar el usuario: ", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

module.exports = ctrlUsuario;
