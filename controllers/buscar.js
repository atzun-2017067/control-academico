const { request, response } = require('express');
const { ObjectId } = require('mongoose').Types;

const Usuario = require('../models/usuario');
const Salon = require('../models/salon');
const Carrera = require('../models/carrera');
const Curso = require('../models/curso');

const coleccionesPermitidas = [
    'usuarios',
    'salones',
    'carreras',
    'cursos',
];


const buscarUsuarios = async (termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino);  //TRUE

    if (esMongoID) {
        const usuario = await Usuario.findById(termino);
        return res.json({
            //results: [ usuario ]
            results: (usuario) ? [usuario] : []
            //Preguntar si el usuario existe, si no existe regresa un array vacio
        });
    }

    //Expresiones regulares, buscar sin impotar mayusculas y minusculas (DIFIERE DE EL)
    const regex = new RegExp(termino, 'i');

    const usuarios = await Usuario.find({
        $or: [{ nombre: regex }, { carnet: regex }, { DPI: regex }, { correo: regex }],
        $and: [{ estado: true }]
    });

    res.json({
        results: usuarios
    })

}

const buscarSalones = async (termino = '', res = response) => {
    const regex = new RegExp(termino, 'i');
    let query;

    if (!isNaN(termino)) {
        query = {
            $and: [
                { estado: true },
                { nivel: parseInt(termino) }
            ]
        };
    } else {
        query = {
            $and: [
                { estado: true },
                {
                    $or: [
                        { codigoSalon: regex },
                        { edificio: regex }
                    ]
                }
            ]
        };
    }

    try {
        const salones = await Salon.find(query);
        res.json({
            results: salones
        });
    } catch (error) {
        console.error('Ocurrió un error al buscar los salones:', error);
        res.status(500).json({
            error: 'Ocurrió un error al buscar los salones'
        });
    }
};



const buscarCarreras = async (termino = '', res = response) => {
    const esMongoID = ObjectId.isValid(termino);

    if (esMongoID) {
        const carrera = await Carrera.findById(termino);
        return res.json({
            results: carrera ? [carrera] : []
        });
    }

    const regex = new RegExp(termino, 'i');

    const carreras = await Carrera.find({
        $or: [
            { codigoTecnico: regex },
            { grado: regex },
            { seccion: regex },
            { jornada: regex }
        ],
        estado: true
    });
    res.json({
        results: carreras
    });
};

const buscarCursos = async (termino = '', res = response) => {
    const esMongoID = ObjectId.isValid(termino);

    if (esMongoID) {
        const curso = await Curso.findById(termino)
            .populate('nombreCurso', 'carrera')
            .populate('codigoCarrera', 'codigoTecnico')
            .populate('horario', 'horarioInicio horarioFinal')
            .populate('profesor', 'nombre')
            .populate('salon', 'edificio nivel codigoSalon');

        return res.json({
            results: curso ? [curso] : []
        });
    }

    const regex = new RegExp(termino, 'i');

    const carreras = await Carrera.find({
        codigoTecnico: regex
    }, '_id');

    const profesores = await Usuario.find({
        nombre: regex
    }, '_id');

    const cursos = await Curso.find({
        $or: [
            { codigoCarrera: { $in: carreras } },
            { profesor: { $in: profesores } }
        ],
        estado: true
    })
        .populate('nombreCurso', 'carrera')
        .populate('codigoCarrera', 'codigoTecnico')
        .populate('horario', 'horarioInicio horarioFinal')
        .populate('profesor', 'nombre')
        .populate('salon', 'edificio nivel codigoSalon');

    const resultados = cursos.map(curso => ({
        _id: curso._id,
        nombreCurso: curso.nombreCurso,
        ciclo: curso.ciclo,
        cupoMinimo: curso.cupoMinimo,
        cupoMaximo: curso.cupoMaximo,
        codigoCarrera: curso.codigoCarrera,
        horario: {
            horarioInicio: curso.horario.horarioInicio,
            horarioFinal: curso.horario.horarioFinal
        },
        profesor: curso.profesor,
        salon: {
            codigoSalon: curso.salon.codigoSalon,
            edificio: curso.salon.edificio,
            nivel: curso.salon.nivel
        }
    }));

    res.json({
        results: resultados
    });
};


const buscar = (req = request, res = response) => {

    const { coleccion, termino } = req.params;

    if (!coleccionesPermitidas.includes(coleccion)) {
        return res.status(400).json({
            msg: `La colección: ${coleccion} no existe en la DB
                  Las colecciones permitidas son: ${coleccionesPermitidas}`
        });
    }


    switch (coleccion) {
        case 'usuarios':
            buscarUsuarios(termino, res);
            break;
        case 'salones':
            buscarSalones(termino, res);
            break;
        case 'carreras':
            buscarCarreras(termino, res);
            break;
        case 'cursos':
            buscarCursos(termino, res);
            break;
        default:
            res.status(500).json({
                msg: 'Ups, se me olvido hacer esta busqueda...'
            });
            break;
    }

}


module.exports = {
    buscar
}