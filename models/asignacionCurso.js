const { Schema, model } = require('mongoose');

const asignacionCursoSchema = Schema({
    carnet: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    curso: {
        type: Schema.Types.ObjectId,
        ref: 'Curso',
        required: [true, 'El curso es obligatorio']
    },
    fechaAsignacion: {
        type: Date
    },
    estado: {
        type: Boolean,
        default: true
    }
});

module.exports = model('Asignacion Curso', asignacionCursoSchema);