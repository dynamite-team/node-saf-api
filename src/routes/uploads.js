const { Router } = require("express");
const { check } = require("express-validator");

const { validarCampos, validarArchivoSubir } = require("../middlewares");
const { subirImagen, actualizarImagen } = require("../controllers/uploads");
const { coleccionesPermitidas } = require("../helpers");

const router = Router();

router.post("/", validarArchivoSubir, subirImagen);

router.put(
  "/:coleccion/:id",
  [
    validarArchivoSubir,
    check("id", "El id debe de ser de mongo").isMongoId(),
    check("coleccion").custom((c) =>
      coleccionesPermitidas(c, [
        "usuarios",
        "productos",
        "categorias",
        "puntos",
      ])
    ),
    validarCampos,
  ],
  actualizarImagen
);

module.exports = router;
