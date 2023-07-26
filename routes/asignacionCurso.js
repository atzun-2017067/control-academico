const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { getAsignacionesCurso, getAsignacionesCursoAlumno, postAsignacionCurso, putAsignacionCurso, deleteAsignacionCurso, deleteAsignacionCursoAdmin} = require('../controllers/asignacionCurso');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole } = require('../middlewares/validar-roles');

const router = Router();

//ADMIN
router.get('/mostrar',[
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], getAsignacionesCurso);

router.delete('/eliminar-admin/:id', [
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], deleteAsignacionCursoAdmin);


//ALUMNO
router.get('/mostrar-alumno',[
    validarJWT,
    tieneRole("ROL_ALUMNO"),
    validarCampos
], getAsignacionesCursoAlumno);

router.post('/asignarse',[
    validarJWT,
    tieneRole("ROL_ALUMNO"),
    validarCampos
], postAsignacionCurso);

router.delete('/eliminar/:id', [
    validarJWT,
    tieneRole("ROL_ALUMNO"),
    validarCampos
], deleteAsignacionCurso);

module.exports = router;