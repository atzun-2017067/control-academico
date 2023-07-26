const jwt = require('jsonwebtoken');

const generarJWT = ( uid = '', rol = '' ) => {
    return new Promise( (resolve, reject) => {
        const payload = { uid, rol }
        jwt.sign( payload, process.env.SECRET_KEY_FOR_TOKEN, {
            expiresIn: '180h'
        }, ( err, token ) => {
            if ( err ) {
                console.log(err);
                reject('No se pudo generar el token');
            } else {
                resolve( token );
            }
        })
    });
}

module.exports = {
    generarJWT
}