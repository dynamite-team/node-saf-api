
const { Router } = require('express');
const { check } = require('express-validator');
const { esRoleValido, existeUsuarioPorId } = require('../helpers/db-validators');

const {
    validarCampos,
    validarJWT,
    esAdminRole,
    tieneRole
} = require('../middlewares');

const {
    usuarioGetAll,
    usuariosGet,
    usuariosPut,
    usuariosDelete,
    usuariosPatch } = require('../controllers/usuarios');

const router = Router();

router.get('/listar', usuarioGetAll);

router.get('/:id', usuariosGet);

router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    check('rol').custom(esRoleValido),
    validarCampos
], usuariosPut);

router.delete('/:id', [
    validarJWT,
    // esAdminRole,
    tieneRole('ADMIN_ROLE', 'VENTAR_ROLE', 'OTRO_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos
], usuariosDelete);

router.patch('/', usuariosPatch);

module.exports = router;