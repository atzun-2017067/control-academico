const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { getCarreras, postCarreras, putCarrera, deleteCarrera} = require('../controllers/carrera');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole } = require('../middlewares/validar-roles');

const router = Router();
router.get('/mostrar',[
    validarCampos
], getCarreras);

router.post('/agregar',[
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], postCarreras);

router.put('/editar/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo Válido').isMongoId(),
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], putCarrera);

router.delete('/eliminar/:id', [
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], deleteCarrera);

module.exports = router;