const { response } = require("express");
const bcryptjs = require("bcryptjs");

const Usuario = require("../models/usuario");

const { generarJWT } = require("../helpers/generar-jwt");
const { googleVerify } = require("../helpers/google-verify");

const ctrlAuth = {};

ctrlAuth.login = async (req, res = response) => {
  const { correo, password } = req.body;

  try {
    // Verificar si el email existe
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({
        msg: "Usuario / Password no son correctos - correo",
      });
    }

    // SI el usuario está activo
    if (!usuario.estado) {
      return res.status(400).json({
        msg: "Usuario / Password no son correctos - estado: false",
      });
    }

    // Verificar la contraseña
    const validPassword = bcryptjs.compareSync(password, usuario.password);
    if (!validPassword) {
      return res.status(400).json({
        msg: "Usuario / Password no son correctos - password",
      });
    }

    // Generar el JWT
    const token = await generarJWT(usuario.id);

    res.json({
      usuario,
      token,
    });
  } catch (err) {
    console.log("Error al iniciar sesión", err);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlAuth.register = async (req, res = response) => {
  const { nombre, correo, password, designado, rol } = req.body;

  try {
    const usuario = new Usuario({ nombre, correo, password, designado, rol });

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);

    // Guardar en BD
    const usuarioRegistrado = await usuario.save();

    const token = await generarJWT(usuarioRegistrado.id);

    res.json({
      usuario,
      token,
    });
  } catch (err) {
    console.log("Error al registrar al usuario: ", error);
    res.status(500).json({
      msg: "Por favor, hable con el administrador",
    });
  }
};

ctrlAuth.renew = async (req = request, res = response) => {
  const { _id } = req.usuario;

  try {
    const usuario = await Usuario.findById(_id);

    const token = await generarJWT(_id);

    res.json({
      ok: true,
      msg: "Token revalidado",
      usuario,
      token,
    });
  } catch (err) {
    console.log("Error al revalidar al token", err);
    return res.status(500).json({
      ok: false,
      msg: "Por favor, hable con el administrador",
    });
  }
};

module.exports = ctrlAuth;
