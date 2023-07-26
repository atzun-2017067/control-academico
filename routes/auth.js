const { Router } = require('express');
const { check } = require('express-validator');

const { login } = require('../controllers/auth');
const { validarCampos } = require('../middlewares/validar-campos');


const router = Router();

router.post('/login', [
    check('user', 'El usuario es obligatorio').not().isEmpty(),
    check('password', 'La password es obligatoria').not().isEmpty(),
    validarCampos,
] ,login);


module.exports = router;