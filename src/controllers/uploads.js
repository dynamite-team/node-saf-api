const cloudinary = require("cloudinary").v2;

const { cloudinary_key } = require("../config");

cloudinary.config(cloudinary_key);

const { response } = require("express");

const { Usuario, Producto } = require("../models");

const ctrlImagen = {};

ctrlImagen.cargarArchivo = async (req = request, res = response) => {
  const { tempFilePath } = req.files.imagen;
  const nombre = uuidv4();

  try {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      tempFilePath,
      { resource_type: "image", public_id: `saf/${nombre}` },
      function (error, result) {
        error && console.log(error);
      }
    );

    res.json({
      ok: true,
      secure_url,
      public_id,
    });
  } catch (msg) {
    res.status(400).json({
      ok: false,
      msg,
    });
  }
};

ctrlImagen.actualizarImagen = async (req, res = response) => {
  const { id, coleccion } = req.params;

  let modelo;

  switch (coleccion) {
    case "usuarios":
      modelo = await Usuario.findById(id);
      if (!modelo) {
        return res.status(400).json({
          msg: `No existe un usuario con el id ${id}`,
        });
      }

      break;

    case "productos":
      modelo = await Producto.findById(id);
      if (!modelo) {
        return res.status(400).json({
          msg: `No existe un producto con el id ${id}`,
        });
      }

      break;

    default:
      return res.status(500).json({ msg: "Se me olvidó validar esto" });
  }

  // Limpiar imágenes previas
  if (modelo.img) {
    const nombreArr = modelo.img.split("/");
    const nombre = nombreArr[nombreArr.length - 1];
    const [public_id] = nombre.split(".");
    cloudinary.uploader.destroy(public_id);
  }

  const { tempFilePath } = req.files.archivo;
  const { secure_url } = await cloudinary.uploader.upload(tempFilePath);
  modelo.img = secure_url;

  await modelo.save();

  res.json(modelo);
};

module.exports = ctrlImagen;
