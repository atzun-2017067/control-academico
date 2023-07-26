const { Schema, model } = require('mongoose');

const SalonSchema = Schema({
    codigoSalon: {
        type: String,
        unique: true,
    },
    descripcion: {
        type: String
    },
    capacidadMaxima:{
        type: Number,
        required: [true, 'La capacidad maxima del salon es obligatorio']
    },
    edificio:{
        type: String,
        required: [true, 'El edificio es obligatorio']
    },
    nivel: {
        type: Number,
        required: [true, 'El nivel es obligatorio' ]
    },
    porDefecto: {
        type: Boolean,
        default: false
    },
    estado: {
        type: Boolean,
        default: true
    },
    img:{
        type: String,
        default: 'Sin imagen'
    }
});

module.exports = model('Salone', SalonSchema);