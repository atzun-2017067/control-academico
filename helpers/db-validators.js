const Usuario = require('../models/usuario');
const Cuenta = require('../models/cuenta');

//Este archivo maneja validaciones personalizadas

const existeUsuarioPorId = async(id) => {

    //Verificar si el ID existe
    const existeUsuarioPorId = await Usuario.findById(id);

    if ( !existeUsuarioPorId ) {
        throw new Error(`El id ${ id } no existe en la DB`);
    }

}

const existeCuentaPorId = async(id) => {

    //Verificar si el ID existe
    const existeCuentaPorId = await Cuenta.findById(id);

    if ( !existeCuentaPorId ) {
        throw new Error(`El id ${ id } no existe en la DB`);
    }

}

module.exports = {
    existeTarjetaPorId,
    existeCuentaPorId
}