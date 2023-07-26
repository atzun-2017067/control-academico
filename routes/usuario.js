const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { getUsuarios, postUsuario, putUsuario, deleteUsuario, getUsuarioPerfil, putUsuarioPerfil, deleteUsuarioPerfil } = require('../controllers/usuario');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole } = require('../middlewares/validar-roles');

const router = Router();

//ADMIN
router.get('/mostrar', [
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR")
], getUsuarios);

router.post('/agregar', [
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], postUsuario);

router.post('/crearCuenta', [
    validarCampos
], postUsuario);

router.put('/editar/:id', [
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], putUsuario);

router.delete('/eliminar/:id', [
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], deleteUsuario);



// USUARIO
router.get('/mostrar-perfil', [
    validarJWT,
    validarCampos
], getUsuarioPerfil);

router.put('/editar-perfil', [
    validarJWT,
    validarCampos
], putUsuarioPerfil);

router.delete('/eliminar-perfil', [
    validarJWT,
    validarCampos
], deleteUsuarioPerfil);

module.exports = router;