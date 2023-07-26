const { response, request } = require('express');
const bcrypt = require('bcryptjs');
const Salon = require('../models/salon');
const Curso = require('../models/curso');

const randomstring = require('randomstring');


// ADMINISTRADOR
const getSalones = async (req, res) => {
    try {
        const listaSalones = await Salon.find({ estado: true });
        res.status(200).json(listaSalones);
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Función para generar el códigoSalon aleatorio
const generarCodigoSalon = async () => {
    let codigoGenerado = '';
    let codigoExiste = true;

    while (codigoExiste) {
        // Generar códigoSalon aleatorio
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numeros = '0123456789';

        codigoGenerado = '';
        for (let i = 0; i < 4; i++) {
            const characters = i === 0 ? letras + numeros : letras + numeros + '-';
            codigoGenerado += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Verificar si el códigoSalon ya existe en la base de datos
        const salonExistente = await Salon.findOne({ codigoSalon: codigoGenerado });

        // Si el códigoSalon no existe, salir del bucle
        if (!salonExistente) {
            codigoExiste = false;
        }
    }
    return codigoGenerado;
};

const postSalones = async (req = request, res = response) => {
    try {
        const {
            descripcion,
            capacidadMaxima,
            edificio,
            nivel,
            porDefecto,
            img
        } = req.body;

        const codigoSalon = await generarCodigoSalon();

        const edificioModificado = edificio.charAt(0).toUpperCase() + edificio.slice(1).toUpperCase();

        const nuevoSalon = new Salon({
            codigoSalon,
            descripcion,
            capacidadMaxima,
            edificio: edificioModificado,
            nivel,
            porDefecto,
            img
        });

        // Verificar si ya existe un salón con el mismo edificio
        const salonExistente = await Salon.findOne({ edificio });

        if (salonExistente) {
            return res.status(400).json({
                mensaje: 'Ya existe un salón con el mismo edificio'
            });
        }

        // Guardar el nuevo salón en la base de datos
        const salonGuardado = await nuevoSalon.save();

        res.json({
            salon: salonGuardado
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: 'Error al guardar el salón'
        });
    }
};


const putSalon = async (req = request, res = response) => {
    const { id } = req.params
    const {
        descripcion,
        capacidadMaxima,
        nivel,
        porDefecto,
        img
    } = req.body;

    try {
        const salonEditado = await Salon.findByIdAndUpdate(id, {
            descripcion: descripcion,
            capacidadMaxima: capacidadMaxima,
            nivel: nivel,
            porDefecto: porDefecto,
            img: img
        });
        if (!salonEditado) {
            return res.status(404).json({ error: 'Salon no encontrado' });
        }

        res.status(201).json(salonEditado);
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/*
const deleteSalon = async (req, res) => {
    const { id } = req.params;
    const salonEncontrado = await Salon.findById(id);

    if (salonEncontrado) {
        if (salonEncontrado.porDefecto) {
            res.status(400).json({ error: 'No se puede eliminar un salón por defecto' });
        } else {
            const salonEliminado = await Salon.findByIdAndDelete(id);
            res.json(salonEliminado);
        }
    } else {
        res.status(404).json({ error: 'Salón no encontrado' });
    }
};
*/

const deleteSalon = async (req, res) => {
    const { id } = req.params;

    try {
        const salonEncontrado = await Salon.findById(id);

        if (!salonEncontrado) {
            return res.status(404).json({ error: 'Salón no encontrado' });
        }

        if (salonEncontrado.porDefecto) {
            return res.status(400).json({ error: 'No se puede eliminar un salón por defecto' });
        }

        const cursos = await Curso.find({ salon: salonEncontrado._id });

        if (cursos.length > 0) {
            const salonPorDefecto = await Salon.findOne({ porDefecto: true });

            if (!salonPorDefecto) {
                return res.status(400).json({ error: 'No hay un salón por defecto' });
            }

            await Promise.all(
                cursos.map(async (curso) => {
                    curso.salon = salonPorDefecto._id;
                    await curso.save();
                })
            );
        }

        const salonEliminado = await Salon.findByIdAndDelete(id);
        res.json(salonEliminado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el salón' });
    }
};


module.exports = {
    getSalones,
    postSalones,
    putSalon,
    deleteSalon
};