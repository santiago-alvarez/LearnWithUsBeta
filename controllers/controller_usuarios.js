const pg = require('../db/db');
const encrypt = require('bcrypt');
const jwt = require('json-web-token');
const controller = {
    generos: async (req, res) => {
        await pg.connect();
        await pg.query('Select * from generos;')
            .then((data) => {
                res.json(data.rows);
            })
            .catch((err) => {
                console.log(err);
            });
        pg.end();
    },
    insert: async (req, res) => {
        try {
            const { nombre, apellido, genero, fecha_n, edad, avatar, usuario, contraseña, correo, registro_sistema } = req.body;
            const cry = await encrypt.hash(contraseña, Math.floor(Math.random() * 1627));
            await pg.connect();
            await pg.query('INSERT INTO usuarios (nombre, apellido, genero, fecha_n, edad, avatar, usuario, contraseña, correo, registro_sistema) VALUES($1, $2, $3, DATE($4), edad_usuarios(DATE($4)), $5, $6, $7, $8, $9) returning id', [nombre, apellido, genero, fecha_n, edad, avatar, usuario, cry, correo, registro_sistema])
                .then((data) => {
                    let id = data.rows[0].id;
                    const jsonData = {
                        id, nombre, apellido, genero, fecha_n, edad, avatar, usuario, cry, correo, registro_sistema
                    }
                    let token = jwt.sign(jsonData, "26-02-2021");
                    res.json({ token, status: true });
                })
                .catch((err) => {
                    res.json({ status: false, err });
                    console.log(err);
                });
            pg.end();
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    }
};
module.exports = controller;