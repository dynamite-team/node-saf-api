const { request, response } = require("express");

const validarArchivoSubir = (req = request, res = response, next) => {
  if (!req.files || Object.keys(req.files).length === 0 || !req.files.imagen) {
    return res.status(400).json({
      msg: "No hay imagenes que subir - validarImagen",
    });
  }

  next();
};

module.exports = {
  validarArchivoSubir,
};
