const { Router } = require("express");
const { check } = require("express-validator");

const { validarCampos, validarArchivoSubir } = require("../middlewares");
const { subirImagen, actualizarImagen } = require("../controllers/uploads");

const router = Router();

router.post("/", [validarArchivoSubir], subirImagen);

module.exports = router;
