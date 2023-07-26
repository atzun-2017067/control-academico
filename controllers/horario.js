const { response, request } = require('express');
const bcrypt = require('bcryptjs');
const Horario = require('../models/horario');
const Curso = require('../models/curso');


// ADMINISTRADOR
const getHorarios = async (req, res) => {
    try {
        const listaHorarios = await Horario.find({ estado: true });
        res.status(200).json(listaHorarios);
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const postHorario = async (req, res) => {
    try {
        // Obtener la fecha y hora actual en formato ISO 8601
        const fechaActual = new Date().toISOString().slice(0, 10); // Obtener solo la fecha en formato "YYYY-MM-DD"

        // Obtener los datos del horario del cuerpo de la solicitud
        let {
            horarioInicio,
            horarioFinal,
            lunes,
            martes,
            miercoles,
            jueves,
            viernes,
            porDefecto
        } = req.body;

        // Ajustar el formato de horarioInicio y horarioFinal a ISO 8601 con la fecha actual
        horarioInicio = `${fechaActual}T${horarioInicio}:00.000Z`;
        horarioFinal = `${fechaActual}T${horarioFinal}:00.000Z`;

        // Convertir las fechas a objetos Date para realizar la comparación
        const fechaInicio = new Date(horarioInicio);
        const fechaFinal = new Date(horarioFinal);

        // Validar que el horario final no sea menor que el horario de inicio
        if (fechaFinal <= fechaInicio) {
            return res.status(400).json({ error: 'El horario final no puede ser menor que el horario de inicio' });
        }

        // Crear una nueva instancia del modelo Horario con los datos proporcionados
        const nuevoHorario = new Horario({
            horarioInicio,
            horarioFinal,
            lunes,
            martes,
            miercoles,
            jueves,
            viernes,
            porDefecto
        });

        // Guardar el nuevo horario en la base de datos
        const horarioGuardado = await nuevoHorario.save();

        res.status(201).json({ horario: horarioGuardado });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al crear el horario' });
    }
};



const putHorario = async (req, res) => {
    try {
        const { id } = req.params; // Obtener el ID del horario de los parámetros de la ruta
        const {
            lunes,
            martes,
            miercoles,
            jueves,
            viernes,
            porDefecto
        } = req.body; // Obtener los nuevos datos del horario del cuerpo de la solicitud

        // Verificar si el horario existe en la base de datos
        const horarioExistente = await Horario.findByIdAndUpdate(id, {
            lunes: lunes,
            martes: martes,
            miercoles: miercoles,
            jueves: jueves,
            viernes: viernes,
            porDefecto: porDefecto
        }, { new: true });

        if (!horarioExistente) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }

        res.json({ horario: horarioExistente });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al actualizar el horario' });
    }
};


const deleteHorario = async (req, res) => {
    const { id } = req.params;

    try {
        const horarioEncontrado = await Horario.findById(id);

        if (!horarioEncontrado) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }

        if (horarioEncontrado.porDefecto) {
            return res.status(400).json({ error: 'No se puede eliminar un horario por defecto' });
        }

        const cursos = await Curso.find({ horario: horarioEncontrado._id });

        if (cursos.length > 0) {
            const horarioPorDefecto = await Horario.findOne({ porDefecto: true });

            if (!horarioPorDefecto) {
                return res.status(400).json({ error: 'No hay un horario por defecto' });
            }

            await Promise.all(
                cursos.map(async (curso) => {
                    curso.horario = horarioPorDefecto._id;
                    await curso.save();
                })
            );
        }

        const horarioEliminado = await Horario.findByIdAndDelete(id);
        res.json(horarioEliminado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el horario' });
    }
};


module.exports = {
    getHorarios,
    postHorario,
    putHorario,
    deleteHorario
};