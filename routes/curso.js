const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { getCursos, getCursosProfesor, postCurso, putCurso, deleteCurso, getCursosAlumno } = require('../controllers/curso');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole } = require('../middlewares/validar-roles');

const router = Router();

router.get('/mostrar',[
    validarCampos
], getCursos);

router.post('/agregar',[
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], postCurso);

router.put('/editar/:id', [
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], putCurso);

router.delete('/eliminar/:id', [
    validarJWT,
    tieneRole("ROL_ADMINISTRADOR"),
    validarCampos
], deleteCurso);


// Cursos del Profesor
router.get('/profesor',[
    validarJWT,
    tieneRole("ROL_PROFESOR", "ROL_ADMINISTRADOR"),
    validarCampos
], getCursosProfesor);


// Cursos del Alumno
router.get('/alumno',[
    validarJWT,
    tieneRole("ROL_ALUMNO"),
    validarCampos
], getCursosAlumno);

module.exports = router;