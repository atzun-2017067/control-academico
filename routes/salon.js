const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { getSalones, postSalones, putSalon, deleteSalon} = require('../controllers/salon');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole } = require('../middlewares/validar-roles');

const router = Router();
router.get('/mostrar',[
    validarCampos
], getSalones);

router.post('/agregar',[
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], postSalones);

router.put('/editar/:id', [
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], putSalon);

router.delete('/eliminar/:id', [
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR")
], deleteSalon);



module.exports = router;