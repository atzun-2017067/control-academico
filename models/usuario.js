const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    carnet: {
        type: String,
        unique: true,
    },
    DPI: {
        type: String,
        required: [true, 'El DPI es obligatorio']
    },
    direccion:{
        type: String,
    },
    celular:{
        type: String,
        required: [true, 'El celular es obligatorio']
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio' ],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'El password es obligatorio' ]
    },
    nombreUsuario: {
        type: String,
        required: [true, 'La identificacion es obligatoria' ]
    },
    rol: {
        type: String,
        required: true,
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

module.exports = model('Usuario', UsuarioSchema);