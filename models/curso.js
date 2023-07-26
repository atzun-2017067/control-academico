const { Schema, model } = require('mongoose');

const CursoSchema = Schema({
    nombreCurso: {
        type: Schema.Types.ObjectId,
        ref: 'Carrera',
        required: [true, 'El nombre del Curso es obligatorio']
    },
    ciclo: {
        type: Date,
        required: [true, 'El ciclo de la carrera es obligatorio']
    },
    cupoMaximo: {
        type: Number,
        default: 1,
        required: [true, 'El grado es obligatorio']
    },
    cupoMinimo: {
        type: Number,
        default: 1,
        required: [true, 'El cupo minimo es obligatorio']
    },
    codigoCarrera: {
        type: Schema.Types.ObjectId,
        ref: 'Carrera',
        required: [true, 'El codigo es obligatorio']
    },
    horario: {
        type: Schema.Types.ObjectId,
        ref: 'Horario',
        required: [true, 'El horario es obligatorio']
    },
    profesor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El profesor es obligatorio']
    },
    salon: {
        type: Schema.Types.ObjectId,
        ref: 'Salone',
        required: [true, 'El salon es obligatorio']
    },
    alumnos: [{
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
    }],
    estado: {
        type: Boolean,
        default: true
    },
    img: {
        type: String,
        default: 'Sin imagen'
    }
});

// Middleware pre-save para asignar automáticamente el "codigoCarrera" basado en el "nombreCurso" seleccionado
CursoSchema.pre('save', async function (next) {
    try {
        // Aquí asumimos que el modelo Carrera tiene un campo llamado "codigoCarrera"
        // Si es diferente, asegúrate de ajustar el nombre del campo adecuadamente.
        const carrera = await this.model('Carrera').findById(this.nombreCurso);
        if (carrera) {
            this.codigoCarrera = carrera.codigoTecnico;
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = model('Curso', CursoSchema);