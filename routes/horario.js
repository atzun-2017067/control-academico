const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { getHorarios, postHorario, putHorario, deleteHorario} = require('../controllers/horario');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole } = require('../middlewares/validar-roles');

const router = Router();
router.get('/mostrar',[
    validarCampos
], getHorarios);

router.post('/agregar',[
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], postHorario);

router.put('/editar/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo Válido').isMongoId(),
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], putHorario);

router.delete('/eliminar/:id', [
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], deleteHorario);



module.exports = router;