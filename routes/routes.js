const express = require('express');
const router = express.Router();
const pg = require('./../db/db');
const usuarios = require('../controllers/controller_usuarios');

/*25/02/2021 - Juan Camilo Montoy Mejía
La query permite extraer los generos*/
router.get('/generos', usuarios.generos);

/*26/02/2021 - Juan Camilo Montoya Mejía / Santiago Álvarez Muñoz
La query permite registrar un usuario*/
router.post('/usuarios-registro', usuarios.insert);

/*26/02/2021 - Juan Camilo Montoya Mejía / Santiago Álvarez Muñoz
La query permite iniciar sesión*/
router.post('/usuarios-inicioSesion', usuarios.start);

/*26/02/2021 - Juan Camilo Montoya Mejía / Santiago Álvarez Muñoz
El middleware obtiene la data del token del usuario*/
router.get('/tokenVerify/:token', usuarios.token_verify);
module.exports = router