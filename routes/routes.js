const express = require('express');
const router = express.Router();
const pg = require('./../db/db');
const usuarios = require('../controllers/controller_usuarios');

/*25/02/2021 - Juan Camilo Montoy Mejía
La query permite extraer los generos*/
router.get('/generos', usuarios.generos);

/*26/02/2021 - Juan camilo Montoya Mejía / Santiago Álvarez Muñoz
LA query permite registrar un usuario*/
router.get('/usuarios-registro', usuarios.insert);
module.exports = router