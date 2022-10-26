const { response, request } = require('express');
const bcryptjs = require('bcryptjs');

const Usuario = require('../models/usuario');

const ctrlUsuario = {};

ctrlUsuario.usuarioGetAll = async (req = request, res = response) => {
    const { desde = 0, hasta = 5 } = req.query;
    const query = { estado: true };

    try {
        const [total, usuarios] = await Promise.all([
            Usuario.countDocuments(query),
            Usuario.find(query).skip(Number(desde)).limit(Number(hasta)),
        ]);

        res.status(200).json({
            total,
            usuarios,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            msg: "Por favor hable con el administrador",
        });
    }
};

ctrlUsuario.usuariosGet = async (req = request, res = response) => {

    const { id } = req.params;
    try {
        //Busco el usuario con dicho ID.
        const usuario = await Usuario.findById(id);
        //Verifico que el usuario este activo.
        if (!usuario.estado) {
            return res.status(400).json({
                ok: false,
                msg: `El usuario ${usuario.nombre} no existe`,
            });
        }
        res.status(200).json({
            usuario,
        });
    } catch (err) {
        console.log("Error al mostrar los datos del usuario: ", err);
        res.status(500).json({
            ok: false,
            msg: "Por favor, hable con el administrador",
        });
    }
}

ctrlUsuario.usuariosPut = async (req, res = response) => {

    const { id } = req.params;
    const { _id, password, google, correo, ...resto } = req.body;

    if (password) {
        // Encriptar la contraseña
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync(password, salt);
    }

    const usuario = await Usuario.findByIdAndUpdate(id, resto);

    res.json(usuario);
}

ctrlUsuario.usuariosPatch = (req, res = response) => {
    res.json({
        msg: 'patch API - usuariosPatch'
    });
}

ctrlUsuario.usuariosDelete = async (req, res = response) => {

    const { id } = req.params;
    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });


    res.json(usuario);
}

module.exports = ctrlUsuario