const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  stats,
  obtenerOrdenes,
  obtenerOrden,
  crearOrden,
  actualizarOrden,
  borrarOrden,
} = require("../controllers/ordenes");

const {
  existeOrdenPorId,
  existeProductoPorId,
} = require("../helpers/db-validators");

const router = Router();

//  Obtener todas las ordenes - publico
router.get("/stats", stats);

//  Obtener todas las ordenes - publico
router.get("/", obtenerOrdenes);

// Obtener una orden por id - publico
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeOrdenPorId),
    validarCampos,
  ],
  obtenerOrden
);

// Crear orden - privado - cualquier persona con un token válido
router.post(
  "/",
  [
    validarJWT,
    check("productos.*.producto").custom(existeProductoPorId),
    check("productos.*.producto", "No es un id de Mongo").isMongoId(),
    validarCampos,
  ],
  crearOrden
);

// Actualizar - privado - cualquiera con token válido
router.put(
  "/:id",
  [
    validarJWT,
    // check('categoria','No es un id de Mongo').isMongoId(),
    check("id").custom(existeOrdenPorId),
    validarCampos,
  ],
  actualizarOrden
);

// Borrar una orden - Admin
router.delete(
  "/:id",
  [
    validarJWT,
    esAdminRole,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeOrdenPorId),
    validarCampos,
  ],
  borrarOrden
);

module.exports = router;
