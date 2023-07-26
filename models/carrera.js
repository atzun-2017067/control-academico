const { Schema, model } = require('mongoose');

const CarreraSchema = Schema({
    codigoTecnico: {
        type: String,
        unique: true
    },
    carrera: {
        type: String,
        required: [true, 'El nombre de la carrera es obligatorio']
    },
    grado:{
        type: String,
        enum: ['4TO', '5TO', '6TO'],
        required: [true, 'El grado es obligatorio']
    },
    seccion:{
        type: String,
        maxlength: 1,
        required: [true, 'La seccion es obligatorio']
    },
    jornada: {
        type: String,
        enum: ['Matutina', 'Vespertina'],
        required: [true, 'La jornada es obligatorio' ]
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

module.exports = model('Carrera', CarreraSchema);