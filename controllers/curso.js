const { response, request } = require('express');
const bcrypt = require('bcryptjs');
const Curso = require('../models/curso');
const Carrera = require('../models/carrera');
const Horario = require('../models/horario');
const Usuario = require('../models/usuario');
const Salon = require('../models/salon');

// Controlador para obtener todos los cursos
const getCursos = async (req = request, res = response) => {
    try {
        const cursos = await Curso.find()
            .populate('nombreCurso', 'carrera')
            .populate('codigoCarrera', 'codigoTecnico')
            .populate('horario', 'horarioInicio horarioFinal')
            .populate('profesor', 'nombre')
            .populate('salon', 'codigoSalon edificio nivel')
            .populate('alumnos', 'nombre carnet');
        res.status(200).json(cursos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Ocurrió un error al obtener los cursos' });
    }
};

const getCursosProfesor = async (req, res) => {
    try {
        const profesorId = req.usuario._id; // Obtener el ID del profesor desde req.usuario

        const cursos = await Curso.find({ profesor: profesorId })
            .select('-img') // Omitir el campo 'img'
            .select('-profesor')
            .populate('nombreCurso', 'carrera') // Solo selecciona el campo 'nombre' del modelo 'Carrera'
            .populate('codigoCarrera', 'codigoTecnico') // Solo selecciona el campo 'codigo' del modelo 'Carrera'
            .populate({
                path: 'horario',
                select: '-img' // Excluir el campo 'img' del modelo 'Horario'
            })
            .populate('salon', 'edificio nivel codigoSalon')
            .populate('alumnos', 'carnet nombre correo')
        res.json(cursos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los cursos del profesor' });
    }
};

const getCursosAlumno = async (req, res) => {
    try {
        const alumnoId = req.usuario._id; // Obtener el ID del profesor desde req.usuario

        const cursos = await Curso.find({ alumnos: alumnoId })
            .select('-img') // Omitir el campo 'img'
            .select('-alumnos')
            .populate('nombreCurso', 'carrera') // Solo selecciona el campo 'nombre' del modelo 'Carrera'
            .populate('codigoCarrera', 'codigoTecnico') // Solo selecciona el campo 'codigo' del modelo 'Carrera'
            .select('-cupoMaximo')
            .select('-cupoMinimo')
            .populate({
                path: 'horario',
                select: '-img' // Excluir el campo 'img' del modelo 'Horario'
            })
            .populate('profesor', 'nombre')
            .populate('salon', 'edificio nivel codigoSalon')
        res.json(cursos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los cursos del alumno' });
    }
};

// const postCurso = async (req = request, res = response) => {
//     try {
//         const {
//             nombreCurso,
//             ciclo,
//             cupoMaximo,
//             cupoMinimo,
//             codigoCarrera,
//             horario,
//             profesor,
//             salon,
//             alumnos,
//             estado,
//             img
//         } = req.body;

//         const cursoExistente = await Carrera.findById(nombreCurso);
//         const carreraExistente = await Carrera.findById(codigoCarrera);
//         const horarioExistente = await Horario.findById(horario);
//         const profesorExistente = await Usuario.findById(profesor);
//         const salonExistente = await Salon.findById(salon);

//         if (carreraExistente && horarioExistente &&
//             profesorExistente && salonExistente && cursoExistente) {
//             // Verificar si el usuario es un profesor
//             if (profesorExistente.rol === 'ROL_PROFESOR') {
//                 const nuevoCurso = new Curso({
//                     nombreCurso,
//                     ciclo,
//                     cupoMaximo,
//                     cupoMinimo,
//                     codigoCarrera,
//                     horario,
//                     profesor,
//                     salon,
//                     alumnos,
//                     estado,
//                     img
//                 });

//                 const cursoGuardado = await nuevoCurso.save();

//                 res.status(201).json({
//                     ok: true,
//                     curso: cursoGuardado
//                 });
//             } else {
//                 res.status(400).json({ error: 'El usuario no tiene el rol de profesor' });
//             }
//         } else {
//             res.status(500).json({ error: 'No se encontró alguna de las entidades relacionadas' });
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             ok: false,
//             error: 'Error al crear el curso'
//         });
//     }
// };

const postCurso = async (req = request, res = response) => {
    try {
        const {
            nombreCurso,
            ciclo,
            cupoMaximo,
            cupoMinimo,
            horario,
            profesor,
            salon,
            alumnos,
            estado,
            img
        } = req.body;

        const carreraExistente = await Carrera.findById(nombreCurso);
        if (!carreraExistente) {
            return res.status(400).json({ error: 'El nombre del curso no existe en la base de datos' });
          }
        const horarioExistente = await Horario.findById(horario);
        const profesorExistente = await Usuario.findById(profesor);
        const salonExistente = await Salon.findById(salon);

        if (carreraExistente && horarioExistente &&
            profesorExistente && salonExistente) {
            // Verificar si el usuario es un profesor
            if (profesorExistente.rol === 'ROL_PROFESOR') {
                // Verificar si se proporcionaron alumnos en la asignación
                let alumnosAsignados = [];
                if (alumnos && alumnos.length > 0) {
                    // Verificar si los usuarios son alumnos
                    const usuariosAlumnos = await Usuario.find({ _id: { $in: alumnos }, rol: 'ROL_ALUMNO' });
                    if (usuariosAlumnos.length !== alumnos.length) {
                        res.status(400).json({ error: 'Uno o más usuarios no tienen el rol de alumno' });
                        return;
                    }
                    alumnosAsignados = usuariosAlumnos.map(usuario => usuario._id);
                }

                const nuevoCurso = new Curso({
                    nombreCurso: carreraExistente._id,
                    ciclo,
                    cupoMaximo,
                    cupoMinimo,
                    codigoCarrera: carreraExistente._id, // Agregar el código de carrera al documento
                    horario,
                    profesor,
                    salon,
                    alumnos: alumnosAsignados,
                    estado,
                    img
                });

                const cursoGuardado = await nuevoCurso.save();

                res.status(201).json({
                    ok: true,
                    curso: cursoGuardado
                });
            } else {
                res.status(400).json({ error: 'El usuario no tiene el rol de profesor' });
            }
        } else {
            res.status(500).json({ error: 'No se encontró alguna de las entidades relacionadas' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            error: 'Error al crear el curso'
        });
    }
};



const putCurso = async (req = request, res = response) => {
    const { id } = req.params
    const {
        ciclo,
        cupoMaximo,
        cupoMinimo,
        horario,
        profesor,
        salon,
        img
    } = req.body;

    try {
        const cursoEditado = await Curso.findByIdAndUpdate(id, {
            ciclo: ciclo,
            cupoMaximo: cupoMaximo,
            cupoMinimo: cupoMinimo,
            horario: horario,
            profesor: profesor,
            salon: salon,
            img: img
        }, { new: true }
        );
        if (!cursoEditado) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        res.status(201).json(cursoEditado);
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const deleteCurso = async (req, res) => {
    const { id } = req.params;

    try {
        const cursoEliminado = await Curso.findByIdAndDelete(id);

        if (!cursoEliminado) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        res.status(200).json({ mensaje: 'Curso eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};


module.exports = {
    getCursos,
    getCursosProfesor,
    getCursosAlumno,
    postCurso,
    putCurso,
    deleteCurso
};
