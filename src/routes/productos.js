const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  obtenerProductosProductor,
  obtenerInventario,
  actualizarInventario,
  obtenerProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  borrarProducto,
  asignarStock,
  borrarStock,
} = require("../controllers/productos");

const {
  existeCategoriaPorId,
  existeProductoPorId,
} = require("../helpers/db-validators");

const router = Router();

router.get("/proveedor/:id", obtenerProductosProductor);

router.get("/inventario", obtenerInventario);

router.put("/inventario/:id", [validarJWT], actualizarInventario);

//  Obtener todas los productos - publico
router.get("/", obtenerProductos);

// Obtener un producto por id - publico
router.get(
  "/:id",
  [
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeProductoPorId),
    validarCampos,
  ],
  obtenerProducto
);

// Crear producto - privado - cualquier persona con un token válido
router.post(
  "/",
  [
    validarJWT,
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("categoria", "No es un id de Mongo").isMongoId(),
    check("categoria").custom(existeCategoriaPorId),
    validarCampos,
  ],
  crearProducto
);

// Actualizar - privado - cualquiera con token válido
router.put(
  "/:id",
  [
    validarJWT,
    // check('categoria','No es un id de Mongo').isMongoId(),
    check("id").custom(existeProductoPorId),
    validarCampos,
  ],
  actualizarProducto
);

router.post(
  "/stock",
  /*  [
    validarJWT,
    // check('categoria','No es un id de Mongo').isMongoId(),
    validarCampos,
  ], */
  asignarStock
);

router.delete(
  "/:uid/:id",
  [
    validarJWT,
    //esAdminRole,
    check("uid", "No es un id de Mongo válido").isMongoId(),
    check("uid").custom(existeProductoPorId),
    check("id", "No es un id de Mongo válido").isMongoId(),
    validarCampos,
  ],
  borrarStock
);

// Borrar una categoria - Admin
router.delete(
  "/:id",
  [
    validarJWT,
    esAdminRole,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeProductoPorId),
    validarCampos,
  ],
  borrarProducto
);

module.exports = router;
