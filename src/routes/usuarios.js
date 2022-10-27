const { Router } = require("express");
const { check } = require("express-validator");
const {
  esRoleValido,
  existeUsuarioPorId,
} = require("../helpers/db-validators");

const {
  validarCampos,
  validarJWT,
  esAdminRole,
  tieneRole,
} = require("../middlewares");

const {
  obtenerUsuarios,
  obtenerUsuario,
  editarUsuario,
  eliminarUsuario,
} = require("../controllers/usuarios");

const router = Router();

router.get("/", obtenerUsuarios);

router.get("/:id", obtenerUsuario);

router.put(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeUsuarioPorId),
    check("rol").custom(esRoleValido),
    validarCampos,
  ],
  editarUsuario
);

router.delete(
  "/:id",
  [
    validarJWT,
    // esAdminRole,
    tieneRole("admin_role"),
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeUsuarioPorId),
    validarCampos,
  ],
  eliminarUsuario
);

module.exports = router;
