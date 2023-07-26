const { response, request } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const Role = require('../models/role');
const Curso = require('../models/curso');


// ADMINISTRADOR
const getUsuarios = async (req, res) => {
  try {
    const listaUsuarios = await Usuario.find({ estado: true });
    res.status(200).json(listaUsuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

let contador = 1;

const generarCarnet = async () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();

  let codigoGenerado = '';
  let codigoExiste = true;

  while (codigoExiste) {
    // Generar códigoSalon con contador
    const codigoContador = contador.toString().padStart(3, '0');
    codigoGenerado = currentYear + codigoContador;

    // Incrementar el contador
    contador++;

    // Verificar si el códigoSalon ya existe en la base de datos
    const carnetExiste = await Usuario.findOne({ carnet: codigoGenerado });

    // Si el códigoSalon no existe, salir del bucle
    if (!carnetExiste) {
      codigoExiste = false;
    }
  }
  return codigoGenerado;
};

const postUsuario = async (req = request, res = response) => {
  const {
    nombre,
    DPI,
    direccion,
    celular,
    correo,
    password,
    nombreUsuario,
    rol,
    img,
    porDefecto,
  } = req.body;

  const carnet = await generarCarnet();

  if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(nombre)) {
    return res.status(400).json({ error: 'El nombre debe contener únicamente letras' });
  }

  if (!/^\d+$/.test(DPI)) {
    return res.status(400).json({ error: 'El DPI debe contener solo números' });
  }

  if (DPI.length !== 13) {
    return res.status(400).json({ error: 'El DPI debe tener una longitud de 13 numeros' });
  }

  if (!/^\d+$/.test(celular)) {
    return res.status(400).json({ error: 'El celular debe contener solo números' });
  }

  if (celular.length !== 8) {
    return res.status(400).json({ error: 'El celular debe tener una longitud de 8 numeros' });
  }

  // Función para capitalizar la primera letra de cada palabra
  const capitalizarPalabras = (str) => {
    return str.toLowerCase().replace(/(^|\s)\S/g, (letra) => letra.toUpperCase());
  };

  // Capitalizar la primera letra de cada palabra en el nombre
  const nombreCapitalizado = capitalizarPalabras(nombre);

  // Formatear el DPI con guiones
  const formattedDPI = `${DPI.substr(0, 4)}-${DPI.substr(4, 5)}-${DPI.substr(9, 4)}`;
  const formattedCelular = `${celular.substr(0, 4)}-${celular.substr(4, 4)}`;

  const correoEncontrado = await Usuario.findOne({ correo: correo });
  const dpiEncontrado = await Usuario.findOne({ DPI: formattedDPI });
  const celularEncontrado = await Usuario.findOne({ celular: formattedCelular });
  const nombreUsuarioEncontrado = await Usuario.findOne({ nombreUsuario: nombreUsuario });

  if (correoEncontrado == null) {
    if (dpiEncontrado == null) {
      if (celularEncontrado == null) {
        if (nombreUsuarioEncontrado == null) {
          try {
            const nuevoUsuario = new Usuario({
              nombre: nombreCapitalizado,
              carnet,
              DPI: formattedDPI,
              correo: correo,
              password: password,
              nombreUsuario: nombreUsuario,
              porDefecto,
              rol: rol,
              img: img,
              direccion: direccion,
              celular: formattedCelular,
            });
            const salt = bcrypt.genSaltSync();
            nuevoUsuario.password = bcrypt.hashSync(password, salt);
            await nuevoUsuario.save();
            res.status(201).json(nuevoUsuario);
          } catch (error) {
            console.error('Error en postUsuario:', error);

            res.status(500).json({ error: 'Error en el servidor', error });
          }
        } else {
          res.status(500).json({ error: 'El nombre de usuario ya está ingresado en la base de datos' });
        }
      } else {
        res.status(500).json({ error: 'El celular ya está ingresado en la base de datos' });
      }
    } else {
      res.status(500).json({ error: 'El DPI ya está ingresado en la base de datos' });
    }
  } else {
    res.status(500).json({ error: 'El correo ya fue ingresado, ingrese otro' });
  }
};



const putUsuario = async (req = request, res = response) => {
  const { id } = req.params
  const usuarioBuscado = await Usuario.findById(id)
  const {
    direccion,
    celular,
    correo,
    password,
    nombreUsuario,
    rol,
    img,
    porDefecto
  } = req.body;

  if (usuarioBuscado.rol != "ROL_ADMINISTRADOR") {
    try {
      // Verificar si el correo ya existe en otro usuario
      const usuarioConCorreo = await Usuario.findOne({ correo: correo });
      if (usuarioConCorreo && usuarioConCorreo._id.toString() !== id) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado por otro usuario' });
      }

      // Verificar si el celular ya existe en otro usuario
      const usuarioConCelular = await Usuario.findOne({ celular: celular });
      if (usuarioConCelular && usuarioConCelular._id.toString() !== id) {
        return res.status(400).json({ error: 'El número de celular ya está registrado por otro usuario' });
      }

      // Verificar si la dirección ya existe en otro usuario
      const usuarioConDireccion = await Usuario.findOne({ direccion: direccion });
      if (usuarioConDireccion && usuarioConDireccion._id.toString() !== id) {
        return res.status(400).json({ error: 'La dirección ya está registrada por otro usuario' });
      }

      // Verificar si el nombre de usuario ya existe en otro usuario
      const usuarioConNombreUsuario = await Usuario.findOne({ nombreUsuario: nombreUsuario });
      if (usuarioConNombreUsuario && usuarioConNombreUsuario._id.toString() !== id) {
        return res.status(400).json({ error: 'El nombre de usuario ya está registrado por otro usuario' });
      }

      // Obtener el número de celular sin guiones
      const formattedCelular = celular.replace(/-/g, '');

      // Agregar el guion correspondiente al número de celular antes de guardarlo
      const guionCelular = `${formattedCelular.substr(0, 4)}-${formattedCelular.substr(4, 4)}`;

      const nuevoUsuario = await Usuario.findByIdAndUpdate(id, {
        direccion: direccion,
        celular: guionCelular,
        correo: correo,
        password: password,
        nombreUsuario: nombreUsuario,
        rol: rol,
        img: img,
        porDefecto: porDefecto
      });
      if (password) {
        const salt = bcrypt.genSaltSync();
        nuevoUsuario.password = bcrypt.hashSync(password, salt);
      }
      await nuevoUsuario.save();
      res.status(201).json(nuevoUsuario);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  } else {
    res.status(500).json({ error: 'No se puede editar a un administrador' });
  }
};

const deleteUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuarioEncontrado = await Usuario.findById(id);

    if (!usuarioEncontrado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuarioEncontrado.porDefecto) {
      return res.status(400).json({ error: 'No se puede eliminar un usuario por defecto' });
    }

    if (usuarioEncontrado.rol === 'ROL_ADMINISTRADOR') {
      return res.status(500).json({ error: 'No se puede eliminar a un administrador' });
    }

    // Agregar la lógica de actualización de cursos relacionados al usuario
    const cursos = await Curso.find({ profesor: usuarioEncontrado._id });

    if (cursos.length > 0) {
      const usuarioPorDefecto = await Usuario.findOne({ porDefecto: true });

      if (!usuarioPorDefecto) {
        return res.status(400).json({ error: 'No hay una usuario por defecto' });
      }

      await Promise.all(
        cursos.map(async (curso) => {
          curso.profesor = usuarioPorDefecto._id;
          await curso.save();
        })
      );
    }

    const usuarioEliminado = await Usuario.findByIdAndDelete(id);
    res.json(usuarioEliminado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};


// AUTOMATICO
const adminPorDefecto = async (req = request, res = response) => {
  try {
    let usuario = new Usuario();
    usuario.nombre = "Anthony";
    usuario.DPI = "2320-40501-0101";
    usuario.direccion = "zona 3";
    usuario.celular = "2025-0203";
    usuario.correo = "admin@gmail.com";
    usuario.password = "ADMIN";
    usuario.nombreUsuario = "ADMIN";
    usuario.porDefecto = true;
    usuario.rol = "ROL_ADMINISTRADOR";
    const usuarioEncontrado = await Usuario.findOne({ nombreUsuario: usuario.nombreUsuario });
    usuario.password = bcrypt.hashSync(usuario.password, bcrypt.genSaltSync());

    if (usuarioEncontrado) return console.log("EL ADMIN ESTA LISTO");
    usuario = await usuario.save();
    if (!usuario) return console.log("EL ADMIN NO ESTA LISTO");
    return console.log("EL ADMIN ESTA LISTO");
  } catch (err) {
    throw new Error(err);
  }
};

// USUARIO
const getUsuarioPerfil = async (req = request, res = response) => {
  const query = req.usuario._id;
  const listaUsuario = await Usuario.find(query)
  res.json(
    listaUsuario
  );
}

const putUsuarioPerfil = async (req = request, res = response) => {
  const id = req.usuario.id;
  const { correo, password, direccion, celular, img } = req.body;

  try {
    // Verificar si el correo editado ya existe
    const existingCorreo = await Usuario.findOne({ correo: correo });

    if (existingCorreo && existingCorreo._id.toString() !== id) {
      return res.status(400).json({ error: 'El correo ya está registrado por otro usuario' });
    }

    // Formatear el número de celular con guiones
    const formattedCelular = `${celular.substr(0, 4)}-${celular.substr(4, 4)}`;

    // Verificar si el celular editado ya existe
    const existingCelular = await Usuario.findOne({ celular: formattedCelular });

    if (existingCelular && existingCelular._id.toString() !== id) {
      return res.status(400).json({ error: 'El número de celular ya está registrado por otro usuario' });
    }

    // Continuar con la edición del usuario si el correo y el celular no están en uso por otros usuarios
    const salt = bcrypt.genSaltSync();
    passwordEncriptada = bcrypt.hashSync(password, salt);
    const usuarioEditado = await Usuario.findByIdAndUpdate(id, {
      correo: correo,
      password: passwordEncriptada,
      direccion: direccion,
      celular: formattedCelular,
      img: img
    }, { new: true });

    if (!usuarioEditado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(201).json(usuarioEditado);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};


const deleteUsuarioPerfil = async (req, res) => {
  const id = req.usuario._id;

  try {
    const usuarioEncontrado = await Usuario.findById(id);

    if (!usuarioEncontrado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuarioEncontrado.porDefecto) {
      return res.status(400).json({ error: 'No se puede eliminar un usuario por defecto' });
    }

    if (usuarioEncontrado.rol === 'ROL_ADMINISTRADOR') {
      return res.status(500).json({ error: 'No se puede eliminar a un administrador' });
    }

    // Agregar la lógica de actualización de cursos relacionados al usuario
    const cursos = await Curso.find({ profesor: usuarioEncontrado._id });

    if (cursos.length > 0) {
      const usuarioPorDefecto = await Usuario.findOne({ porDefecto: true });

      if (!usuarioPorDefecto) {
        return res.status(400).json({ error: 'No hay un usuario por defecto' });
      }

      await Promise.all(
        cursos.map(async (curso) => {
          curso.profesor = usuarioPorDefecto._id;
          await curso.save();
        })
      );
    }

    const usuarioEliminado = await Usuario.findByIdAndDelete(id);
    res.json(usuarioEliminado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};



const roles = async (req, res) => {
  try {
    let role = new Role();
    let role2 = new Role();
    let role3 = new Role();
    role.rol = "ROL_ADMINISTRADOR";
    role2.rol = "ROL_PROFESOR";
    role3.rol = "ROL_ALUMNO";
    const rolBusca = await Role.findOne({ rol: role.rol })
    if (rolBusca != null) {
      return console.log("LOS ROLES ESTAN LISTOS");
    } else {
      rol1 = await role.save();
      rol2 = await role2.save();
      rol3 = await role3.save();
      if (!rol1 && !rol2 && !rol3) return console.log("LOS ROLES NO ESTAN LISTOS");
      return console.log("LOS ROLES ESTAN LISTOS");
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  //ADMIN
  getUsuarios,
  postUsuario,
  putUsuario,
  deleteUsuario,

  adminPorDefecto,
  roles,

  //USUARIO PERFIL
  getUsuarioPerfil,
  putUsuarioPerfil,
  deleteUsuarioPerfil,
};