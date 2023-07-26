const express = require('express');
const cors = require('cors');
const { dbConection } = require('../database/config');
const { roles, adminPorDefecto } = require('../controllers/usuario');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        this.paths = {
            auth:               '/api/auth',
            buscar:             '/api/buscar',
            usuario:            '/api/usuarios',
            salon:              '/api/salones',
            carrera:            '/api/carreras',
            horario:            '/api/horarios',
            curso:              '/api/cursos',
            asignacionCurso:    '/api/asignaciones',
        }


        this.conectarDB();

        this.middlewares();

        this.routes();

        roles();

        adminPorDefecto();
    }

    async conectarDB() {
        await dbConection();
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));
    }


    routes() {
        this.app.use(this.paths.auth, require('../routes/auth'));
        this.app.use(this.paths.buscar, require('../routes/buscar'));
        this.app.use(this.paths.usuario, require('../routes/usuario'));
        this.app.use(this.paths.salon, require('../routes/salon'));
        this.app.use(this.paths.carrera, require('../routes/carrera'));
        this.app.use(this.paths.horario, require('../routes/horario'));
        this.app.use(this.paths.curso, require('../routes/curso'));
        this.app.use(this.paths.asignacionCurso, require('../routes/asignacionCurso'));
    }


    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto ', this.port);
        })
    }


}


module.exports = Server;