const { Schema, model } = require('mongoose');

const RoleSchema = Schema({
    rol: {
        type: String,
        //default: "ROL_ALUMNO",
        required: [true , 'El rol es obligatorio']
    },
});


module.exports = model('Role', RoleSchema);