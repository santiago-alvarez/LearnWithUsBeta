const express = require('express');
const router = express.Router();
const pg = require('./../db/db');
const usuarios = require('../controllers/controller_usuarios');
const clases = require('../controllers/controller_clases');
const usuario_clase = require('../controllers/controller_usuarioClase');
const cursos = require('../controllers/controller_cursos');
const usuario_curso = require('../controllers/controller_usuarioCurso');

/*==================================================================
                    MIDDLEWARE DE USUARIOS
===================================================================*/
/*25/02/2021 - Juan Camilo Montoy Mejía 
La query permite extraer los generos*/
router.get('/generos', usuarios.generos);

/*26/02/2021 - Juan Camilo Montoya Mejía / Santiago Álvarez Muñoz
El middleware obtiene la data del token del usuario*/
router.get('/tokenVerify/:token', usuarios.token_verify);

/*26/02/2021 - Juan Camilo Montoya Mejía / Santiago Álvarez Muñoz
La query permite registrar un usuario*/
router.post('/usuarios-registro', usuarios.insert);

/*26/02/2021 - Juan Camilo Montoya Mejía / Santiago Álvarez Muñoz
La query permite iniciar sesión*/
router.post('/usuarios-inicioSesion', usuarios.start);

/*26/02/2021 - Santiago Álvarez Muñoz
El middleware permíte actualizar cualquier aspecto de la información del usuario*/
router.put('/usuarios-actualizacion', usuarios.update);

/*==================================================================
                    MIDDLEWARE DE CLASES
===================================================================*/
/*26/02/2021 - Santiago Álvarez Muñoz
El middleware permíte ingresar una clase nueva*/
router.post('/clases-registro', clases.insert);

/*26/02/2021 - Santiago Álvarez Muñoz
El middleware permíte editar el título de la clase*/
router.put('/clases-update', clases.update);

/*27/02/2021 - Santiago Álvarez Muñoz
El middleware obtiene todas las clases creadas*/
router.get('/clases-creadas/:id_creador', clases.get_credas);

/*27/02/2021 - Santiago Álvarez Muñoz
El middleware obtiene  todas las clases inscritas*/
router.get('/clases-inscritas/:id_usuario', clases.get_inscritas);

/*27/02/2021 - Santiago Álvarez Muñoz
El middleware permíte ver los cursos de un curso*/
router.get('/clases-cursosClase/:id_clase', clases.get_cursos_clase);

/*28/02/2021 - Santiago Álvarez Muñoz
El middleware genera el informe de la calificación de un usuario en los cursos de una clase*/
router.get('/clases-cursoClase-informe/:id_clase&:id_curso', clases.get_informe);

/*27/02/2021 - Santiago Álvarez Muñoz
El middleware permite eliminr una clase*/
router.delete('/clases-delete/:id', clases.delete);

/*==================================================================
                MIDDLEWARE DE USUARIOS_CLASE
===================================================================*/
/*26/02/2021 - Santiago Álvarez Muñoz
El middleware permíte ingresar un usuario a una, de igual manera actualiza
la cantidad de usuarios de la clase.*/
router.post('/usuarioClase-registo', usuario_clase.insert);

/*27/02/2021 - Santiago Álvarez Muñoz
El middleware permíte obtener la información básica de los usuarios que hacen parte de una clase.*/
router.get('/usuariosClase-infoName/:id_clase', usuario_clase.info_name);

/*27/02/2021 - Santiago Álvarez Muñoz
El middleware permite a un usuario salirse de una clase o que el credor lo elimine*/
router.delete('/usuarioClase-delete/:id_clase&:token', usuario_clase.delete);

/*==================================================================
                    MIDDLEWARE DE CURSOS
===================================================================*/
/*27/02/2021 - Santiago Álvarez Muñoz
El middleware permíte ingresar un curso nuevo*/
router.post('/cursos-registro', cursos.insert);

/*28/02/2021 - Santiago Álvarez Muñoz
El middleware permíte editar la información básica de un curso (Titulo, materia)*/
router.put('/cursos-updateInfo', cursos.update_info);

/*28/02/2021 - Santiago Álvarez Muñoz
El middleware permíte cambiar la privacidad de un curso sea a público o privado*/
router.put('/cursos-updatePrivacidad', cursos.update_privacidad);

/*28/02/2021 - Santiago Álvarez Muñoz
El middleware permíte obtener todos los cursos, sea para la comunidad o los integrados*/
router.get('/cursos-comunidad-integrado', cursos.get_comunidad_integrado);

/*==================================================================
                MIDDLEWARE DE USUARIOS_CURSO
===================================================================*/
/*28/02/2021 - Santiago Álvarez Muñoz
El middleware permíte ingresar un usuario a un curso*/
router.post('/usuariosCurso-registro/:token&:id_curso', usuario_curso.insert);

/*28/02/2021 - Santiago Álvarez Muñoz
El middleware permíte valorar un curso*/
router.put('/usuariosCurso-update-valoracion', usuario_curso.update_valoracion_curso);
module.exports = router