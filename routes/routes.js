const express = require('express');
const router = express.Router();
const pg = require('./../db/db');
/*Multer*/
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/*Controladores*/
const usuarios = require('../controllers/controller_usuarios');
const clases = require('../controllers/controller_clases');
const usuario_clase = require('../controllers/controller_usuarioClase');
const cursos = require('../controllers/controller_cursos');
const usuario_curso = require('../controllers/controller_usuarioCurso');
const unidades = require('../controllers/controller_unidades');
const usuario_unidad = require('../controllers/controller_usuarioUnidad');

/*==================================================================
                    MIDDLEWARE DE USUARIOS
===================================================================*/
/*25/02/2021 - Juan Camilo Montoy Mejía 
La query permite extraer los generos*/
router.get('/generos', usuarios.generos);

/*26/02/2021 - Juan Camilo Montoya Mejía / Santiago Álvarez Muñoz
El middleware obtiene la data del token del usuario*/
router.get('/tokenVerify/:token', usuarios.token_verify);

/*01/03/2021 - Santiago Álvarez Muñoz
El middleware obtiene la información necesaria para determinar el registro del usuario.*/
router.get('/usuarios-info-registro', usuarios.get_info_registro);

/*01/03/2021 - Santiago Álvarez Muñoz - Juan Camilo Montoya Mejía
El middleware obtiene la información de todos los usuarios*/
router.get('/usuarios-all-users/:offset', usuarios.get_all_users);

/*01/03/2021 - Santiago Álvarez Muñoz
EL middleware obtiene la información de un único usuario para mostrarlo en su perfíl*/
router.get('/usuarios-user-info/:id', usuarios.user_info);

/*26/02/2021 - Juan Camilo Montoya Mejía / Santiago Álvarez Muñoz
La query permite registrar un usuario*/
router.post('/usuarios-registro', usuarios.insert);

/*26/02/2021 - Juan Camilo Montoya Mejía / Santiago Álvarez Muñoz
La query permite iniciar sesión*/
router.post('/usuarios-inicioSesion', usuarios.start);

/*01/03/2021 - Juan Camilo Montoya Mejía
El middlewere ejecuta el envio del codigo de verificacion al correo del usuario al registrarce*/
router.post('/usuarios-correo', usuarios.correo);

/*01/03/2021 - Santiago Álvarez Muñoz
El middleware permite seguir a un usuario*/
router.post('/usuarios-follow', usuarios.follow);

/*01/03/2021 - Santiago Álvarez Muñoz  / Juan Camilo Montoya Mejía
El middleware suba la imagen de perfíl nueva al google cloud plataform*/
router.post('/usuarios-upload-avatar', upload.single('image'), usuarios.upload_avatar);

/*26/02/2021 - Santiago Álvarez Muñoz
El middleware permíte actualizar cualquier aspecto de la información básica del usuario*/
router.put('/usuarios-actualizacion', usuarios.update);

/*01/03/2021 - Santiago Álvarez Muñoz
El middleware permíte actualizar la contraseña del usuario.*/
router.put('/usuarios-actualizacion-contrasena', usuarios.update_password);

/*28/02/2021 - Santiago Álvarez Muñoz
El diddleware realiza el borrado lógico del usuario*/
router.put('/usuarios-delete/:id', usuarios.delete_account);

/*01/03/2021 - Santiago Álvarez Muñoz
El middleware reactiva la cuenta en caso de haber realizado un borrado lógico*/
router.put('/usuarios-activate-account', usuarios.activate_account);

/*01/03/2021 - Santiago Álvarez Muñoz
El middleware permite dejar de seguir a un usuario*/
router.delete('/usuarios-stop-following', usuarios.stop_following);

/*01/03/2021 - juan Camilo Montoya Mejía / Santiago Álvarez Muñoz
El middleware permite eliminar la imagen de perfíl del google cloud plataform*/
router.delete('/usuarios-delete-avatar',usuarios.delete_avatar);

/*==================================================================
                    MIDDLEWARE DE CLASES
===================================================================*/
/*26/02/2021 - Santiago Álvarez Muñoz
El middleware permíte ingresar una clase nueva*/
router.post('/clases-registro', clases.insert);

/*26/02/2021 - Santiago Álvarez Muñoz
El middleware permíte edit}ar el título de la clase*/
router.put('/clases-update', clases.update);

/*27/02/2021 - Santiago Álvarez Muñoz
El middleware obtiene todas las clases creadas*/
router.get('/clases-creadas/:token', clases.get_credas);

/*27/02/2021 - Santiago Álvarez Muñoz
El middleware obtiene  todas las clases inscritas*/
router.get('/clases-inscritas/:id_usuario', clases.get_inscritas);

/*28/02/2021 - Santiago Álvarez Muñoz
El middleware genera el informe de la calificación de un usuario en los cursos de una clase*/
router.get('/clases-cursoClase-informe/:id_clase&:id_curso', clases.get_informe);

/*11/03/2021 - Santiago Álvarez Muñoz
El middleware genera el informe en un pdf*/
router.get('/clases-pdfInforme/donwload/:id_curso&:id_clase&:titulo', clases.pdf_informe);

/*12/03/2021 - Santiago Álvarez Muñoz
El middleware genera el informe en un xlsx*/
router.get('/clases-xlsxInforme/donwload/:id_curso&:id_clase', clases.xlsx_informe);

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

/*05703/2021 - Santiago Álvarez Muñoz
El middleware permíte mover un curso a una clase o sacarlo de ahí*/
router.put('/cursos-move', cursos.move_curso_clase);

/*28/02/2021 - Santiago Álvarez Muñoz
El middleware permíte obtener todos los cursos, sea para la comunidad o los integrados*/
router.get('/cursos-comunidad-integrado', cursos.get_comunidad_integrado);

/*05/03/2021 - Santiago Álvarez Muñoz
El middleware permíte obtener todos los cursos iniciados*/
router.get('/cursos-iniciados', cursos.get_iniciados);

/*05/03/2021 - Santiago Álvarez Muñoz
El middleware permíte obtener todos los cursos creados*/
router.get('/cursos-creados', cursos.get_creados);

/*09/03/2021 - Santiago Álvarez Muñoz
El middleware permíte obtener los cursos terminados de un usuario*/
router.get('/cursos-terminados', cursos.get_terminados);

/*27/02/2021 - Santiago Álvarez Muñoz
El middleware permíte ver los cursos de un curso*/
router.get('/cursos-cursosClase/:id_clase', cursos.get_cursos_clase);

/*10/03/2021 - Santiago Álvarez Muñoz
El middleware permíte eliminar un curso*/
router.delete('/cursos-delete', cursos.delete);

/*==================================================================
                MIDDLEWARE DE USUARIOS_CURSO
===================================================================*/
/*28/02/2021 - Santiago Álvarez Muñoz
El middleware permíte ingresar un usuario a un curso*/
router.post('/usuariosCurso-registro/:token&:id_curso', usuario_curso.insert);

/*28/02/2021 - Santiago Álvarez Muñoz
El middleware permíte valorar un curso*/
router.put('/usuariosCurso-update-valoracion', usuario_curso.update_valoracion_curso);

/*10/03/2021 - Santiago Álvarez Muñoz
El middleware permíte saber si ya se ha iniciado un curso o no para poder valorarlo*/
router.get('/usuariosCurso-infoIniciado-valoracion', usuario_curso.get_info_iniciado);

/*==================================================================
                     MIDDLEWARE DE UNIDADES
===================================================================*/
/*05/03/2021 - Santiago Álvarez Muñoz
El middleware permíte insertar una unidad dentro de un curso*/
router.post('/unidades-insert', unidades.insert);

/*09/03/2021 - Santiago Álvarez Muñoz
El middleware permíte editar el título y la temática de una unidad*/
router.put('/unidades-update', unidades.update);

/*09/03/2021 - Santiago Álvarez Muñoz
El middleware permíte eliminar una unidad*/
router.delete('/unidades-delete/:id_unidad', unidades.delete);

/*==================================================================
                  MIDDLEWARE DE USUARIO-UNIDAD
===================================================================*/
/*09/03/2021 - Santiago Álvarez Muñoz
El middleware permíte que un usuario inicie una unidad*/
router.post('/usuarioUnidad-insert', usuario_unidad.insert);

module.exports = router