const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  obtenerPuntos,
  obtenerPunto,
  crearPunto,
  actualizarPunto,
  borrarPunto,
} = require("../controllers/puntos");
const { existePuntoPorId } = require("../helpers/db-validators");

const router = Router();

//  Obtener todos los puntos - publico
router.get("/", obtenerPuntos);

// Obtener un punto por id - publico
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existePuntoPorId),
    validarCampos,
  ],
  obtenerPunto
);

// Crear punto - privado - cualquier persona con un token válido
router.post(
  "/",
  [
    validarJWT,
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  crearPunto
);

// Actualizar - privado - cualquiera con token válido
router.put(
  "/:id",
  [
    validarJWT,
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("id").custom(existePuntoPorId),
    validarCampos,
  ],
  actualizarPunto
);

// Borrar un punto - Admin
router.delete(
  "/:id",
  [
    validarJWT,
    esAdminRole,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existePuntoPorId),
    validarCampos,
  ],
  borrarPunto
);

module.exports = router;
