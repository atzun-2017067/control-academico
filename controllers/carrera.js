const { response, request } = require('express');
const bcrypt = require('bcryptjs');
const Carrera = require('../models/carrera');
const Curso = require('../models/curso');

const randomstring = require('randomstring');


// ADMINISTRADOR
const getCarreras = async (req, res) => {
    try {
        const listaCarreras = await Carrera.find({ estado: true });
        res.status(200).json(listaCarreras);
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Función para generar el códigoSalon aleatorio
const generarCodigoCarrera = async () => {
    let codigoGenerado = '';
    let codigoExiste = true;

    while (codigoExiste) {
        // Generar códigoSalon aleatorio
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numeros = '0123456789';

        codigoGenerado = '';
        for (let i = 0; i < 5; i++) {
            const characters = i === 0 ? letras + numeros : letras + numeros + '-';
            codigoGenerado += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Verificar si el códigoSalon ya existe en la base de datos
        const carreraExistente = await Carrera.findOne({ codigoCarrera: codigoGenerado });

        // Si el códigoCarrera no existe, salir del bucle
        if (!carreraExistente) {
            codigoExiste = false;
        }
    }
    return codigoGenerado;
};

const postCarreras = async (req = request, res = response) => {
    try {
        const {
            carrera,
            grado,
            seccion,
            jornada,
            porDefecto,
            img
        } = req.body;

        // Validar que el campo carrera esté presente
        if (!carrera) {
            return res.status(400).json({
                mensaje: 'El campo carrera es obligatorio'
            });
        }

        // Validar grado
        const gradoValido = ['4TO', '5TO', '6TO'];
        if (!gradoValido.includes(grado.charAt(0).toUpperCase() + grado.slice(1).toUpperCase())) {
            return res.status(400).json({
                mensaje: 'El grado debe ser 4TO, 5TO o 6TO'
            });
        }

        // Validar que seccion sea un carácter alfabético
        if (!/^[a-zA-Z]$/.test(seccion)) {
            return res.status(400).json({
                mensaje: 'La sección debe ser un solo carácter alfabético'
            });
        }

        // Validar que seccion sea un carácter
        if (seccion.length !== 1) {
            return res.status(400).json({
                mensaje: 'La sección debe ser un solo carácter'
            });
        }

        const jornadaValida = ['Vespertina', 'Matutina'];
        if (!jornadaValida.includes(jornada.charAt(0).toUpperCase() + jornada.slice(1).toLowerCase())) {
            return res.status(400).json({
                mensaje: 'La jornada debe ser Vespertina o Matutina'
            });
        }

        const codigoTecnico = await generarCodigoCarrera();

        // Formatear la jornada con la primera letra en mayúscula y las demás en minúscula
        const carreraModificada = carrera.charAt(0).toUpperCase() + carrera.slice(1).toLowerCase();
        const gradoModificado = grado.charAt(0).toUpperCase() + grado.slice(1).toUpperCase();
        const seccionModificado = seccion.charAt(0).toUpperCase();
        const jornadaModificada = jornada.charAt(0).toUpperCase() + jornada.slice(1).toLowerCase();

        const nuevaCarrera = new Carrera({
            codigoTecnico,
            carrera: carreraModificada,
            grado: gradoModificado,
            seccion: seccionModificado,
            jornada: jornadaModificada,
            porDefecto,
            img
        });

        // Guardar la nueva carrera en la base de datos
        const carreraGuardado = await nuevaCarrera.save();

        res.json({
            carrera: carreraGuardado
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: 'Error al guardar la carrera'
        });
    }
};

const putCarrera = async (req = request, res = response) => {
    const { id } = req.params;
    const { grado, seccion, jornada, porDefecto, img } = req.body;

    try {
        const carreraExistente = await Carrera.findById(id);

        if (!carreraExistente) {
            return res.status(404).json({ error: 'Carrera no encontrada' });
        }

        const gradoModificado = grado ? grado.charAt(0).toUpperCase() + grado.slice(1).toUpperCase() : undefined;
        const seccionModificada = seccion ? seccion.charAt(0).toUpperCase() : undefined;
        const jornadaModificada = jornada ? jornada.charAt(0).toUpperCase() + jornada.slice(1).toLowerCase() : undefined;

        if (grado && !['4TO', '5TO', '6TO'].includes(gradoModificado)) {
            return res.status(400).json({ mensaje: 'El grado debe ser 4TO, 5TO o 6TO' });
        }

        if (seccion && seccion.length !== 1) {
            return res.status(400).json({ mensaje: 'La sección debe ser un solo carácter' });
        }

        if (jornada && !['Matutina', 'Vespertina'].includes(jornadaModificada)) {
            return res.status(400).json({ mensaje: 'La jornada debe ser Matutina o Vespertina' });
        }

        // Verificar si porDefecto está presente en req.body y asignar su valor correspondiente
        carreraExistente.porDefecto = porDefecto !== undefined ? porDefecto : carreraExistente.porDefecto;
        carreraExistente.grado = gradoModificado || carreraExistente.grado;
        carreraExistente.seccion = seccionModificada || carreraExistente.seccion;
        carreraExistente.jornada = jornadaModificada || carreraExistente.jornada;
        carreraExistente.img = img || carreraExistente.img;

        const carreraActualizada = await carreraExistente.save();

        res.status(200).json(carreraActualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};


/*
const deleteCarrera = async (req, res) => {
    const { id } = req.params;
    const carreraEncontrada = await Carrera.findById(id);

    if (carreraEncontrada) {
        if (carreraEncontrada.porDefecto) {
            res.status(400).json({ error: 'No se puede eliminar una carrera por defecto' });
        } else {
            const carreraEliminada = await Carrera.findByIdAndDelete(id);
            res.json(carreraEliminada);
        }
    } else {
        res.status(404).json({ error: 'Carrera no encontrada' });
    }
};
*/

const deleteCarrera = async (req, res) => {
    const { id } = req.params;

    try {
        const carreraEncontrada = await Carrera.findById(id);

        if (!carreraEncontrada) {
            return res.status(404).json({ error: 'Carrera no encontrada' });
        }

        if (carreraEncontrada.porDefecto) {
            return res.status(400).json({ error: 'No se puede eliminar una carrera por defecto' });
        }

        const cursos = await Curso.find({ codigoCarrera: carreraEncontrada._id });

        if (cursos.length > 0) {
            const carreraPorDefecto = await Carrera.findOne({ porDefecto: true });

            if (!carreraPorDefecto) {
                return res.status(400).json({ error: 'No hay una carrera por defecto' });
            }

            await Promise.all(
                cursos.map(async (curso) => {
                    if (curso.codigoCarrera.equals(carreraEncontrada._id)) {
                        curso.codigoCarrera = carreraPorDefecto._id;
                    }
                    if (curso.nombreCurso.equals(carreraEncontrada._id)) {
                        curso.nombreCurso = carreraPorDefecto._id;
                    }
                    await curso.save();
                })
            );
        }

        const carreraEliminada = await Carrera.findByIdAndDelete(id);
        res.json(carreraEliminada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la carrera' });
    }
};



module.exports = {
    getCarreras,
    postCarreras,
    putCarrera,
    deleteCarrera
};