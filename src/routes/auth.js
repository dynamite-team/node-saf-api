const { Router } = require("express");
const { check } = require("express-validator");
const { esRoleValido, emailExiste } = require("../helpers/db-validators");
const { login, register, renew } = require("../controllers/auth");
const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const router = Router();

router.post(
  "/login",
  [
    check("correo", "El correo es obligatorio").isEmail(),
    check("password", "La contraseña es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  login
);

router.post(
  "/registro",
  [
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("password", "El password debe de ser más de 6 letras").isLength({
      min: 6,
    }),
    check("correo", "El correo no es válido").isEmail(),
    check("correo").custom(emailExiste),
    // check('rol', 'No es un rol válido').isIn(['ADMIN_ROLE','USER_ROLE']),
    check("rol").custom(esRoleValido),
    validarCampos,
  ],
  register
);

router.get("/renew", [validarJWT], renew);

module.exports = router;
