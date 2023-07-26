const { Schema, model } = require('mongoose');

const HorarioSchema = Schema({
    horarioInicio: {
        type: Date,
        required: [true, 'El horario de inicio es obligatorio']
    },
    horarioFinal: {
        type: Date,
        required: [true, 'El horario de inicio es obligatorio']
    },
    lunes: {
        type: Boolean,
        default: false
    },
    martes: {
        type: Boolean,
        default: false
    },
    miercoles: {
        type: Boolean,
        default: false
    },
    jueves: {
        type: Boolean,
        default: false
    },
    viernes: {
        type: Boolean,
        default: false
    },
    porDefecto: {
        type: Boolean,
        default: false
    },
    estado: {
        type: Boolean,
        default: true
    }
});

module.exports = model('Horario', HorarioSchema);