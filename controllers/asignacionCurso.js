const { response, request } = require('express');
const bcrypt = require('bcryptjs');

const AsignacionCurso = require('../models/asignacionCurso');
const Curso = require('../models/curso');


const getAsignacionesCurso = async (req, res) => {
    try {
        // Obtener las asignaciones de curso actualizadas
        const asignacionesCurso = await AsignacionCurso.find()
            .populate({
                path: 'carnet',
                select: 'carnet'
            })
            .populate({
                path: 'curso',
                select: 'nombreCurso',
                populate: {
                    path: 'nombreCurso',
                    model: 'Carrera',
                    select: 'carrera'
                }
            });

        // Eliminar las asignaciones de curso donde el campo curso no existe en la colección Curso
        for (const asignacion of asignacionesCurso) {
            if (!asignacion.curso) {
                await AsignacionCurso.deleteOne({ _id: asignacion._id });
            }
        }

        res.json(asignacionesCurso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las asignaciones de curso' });
    }
};

const deleteAsignacionCursoAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si la asignación de curso existe
        const asignacionCurso = await AsignacionCurso.findById(id);

        if (!asignacionCurso) {
            return res.status(404).json({ error: 'No se encontró la asignación de curso' });
        }

        // Obtener el curso de la asignación de curso
        const curso = asignacionCurso.curso;

        // Eliminar la asignación de curso
        await AsignacionCurso.deleteOne({ _id: id });

        // Eliminar al alumno del curso
        await Curso.findByIdAndUpdate(curso, { $pull: { alumnos: asignacionCurso.carnet } });

        res.json({ mensaje: 'Asignación de curso eliminada con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la asignación de curso' });
    }
};



// Alumno
const getAsignacionesCursoAlumno = async (req, res) => {
    try {
        const carnet = req.usuario._id; // Obtener el carnet del usuario autenticado

        // Obtener las asignaciones de curso del alumno autenticado
        const asignacionesCurso = await AsignacionCurso.find({ carnet })
            .populate({
                path: 'curso',
                select: 'nombreCurso',
                populate: {
                    path: 'nombreCurso',
                    model: 'Carrera',
                    select: 'carrera',
                },
            })
            .populate('carnet', 'carnet');

        // Eliminar las asignaciones de curso donde el campo curso no existe en la colección Curso
        for (const asignacion of asignacionesCurso) {
            if (!asignacion.curso) {
                await AsignacionCurso.deleteOne({ _id: asignacion._id });
            }
        }
        res.json(asignacionesCurso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las asignaciones de curso' });
    }
};


const postAsignacionCurso = async (req, res) => {
    const { curso } = req.body;

    try {
        const carnet = req.usuario._id; // Obtener el carnet del usuario autenticado
        const fechaAsignacion = new Date(); // Establecer la fecha actual como valor predeterminado

        // Verificar si el curso existe
        const cursoExistente = await Curso.findById(curso);

        if (!cursoExistente) {
            return res.status(404).json({ error: 'El curso no existe' });
        }

        // Verificar si el alumno ya está asignado al curso
        const asignacionExistente = await AsignacionCurso.findOne({ carnet, curso });

        if (asignacionExistente) {
            return res.status(400).json({ error: 'El alumno ya está asignado a este curso' });
        }

        const asignacionCurso = new AsignacionCurso({
            carnet,
            curso,
            fechaAsignacion
        });

        // Guardar el nuevo documento de asignacionCurso
        const nuevaAsignacionCurso = await asignacionCurso.save();

        // Obtener el curso correspondiente y realizar la inserción del alumno
        const cursoActualizado = await Curso.findByIdAndUpdate(curso, { $push: { alumnos: carnet } }, { new: true });

        res.status(201).json(nuevaAsignacionCurso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la asignación del curso' });
    }
};


const deleteAsignacionCurso = async (req, res) => {
    const { id } = req.params;
    const carnet = req.usuario._id; // Obtener el carnet del usuario autenticado

    try {
        // Verificar si la asignación de curso existe y pertenece al alumno
        const asignacionCurso = await AsignacionCurso.findOne({ _id: id, carnet });

        if (!asignacionCurso) {
            return res.status(404).json({ error: 'No se encontró la asignación de curso' });
        }

        // Obtener el curso de la asignación de curso
        const curso = asignacionCurso.curso;

        // Eliminar la asignación de curso
        await AsignacionCurso.deleteOne({ _id: id });

        // Eliminar al alumno del curso
        await Curso.findByIdAndUpdate(curso, { $pull: { alumnos: carnet } });

        res.json({ mensaje: 'Asignación de curso eliminada con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la asignación de curso' });
    }
};



module.exports = {
    getAsignacionesCurso,
    getAsignacionesCursoAlumno,
    postAsignacionCurso,
    deleteAsignacionCurso,
    deleteAsignacionCursoAdmin
};