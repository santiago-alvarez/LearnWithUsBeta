const pg = require('../db/db');
const encrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const controller = {
    generos: async (req, res) => {
        let conection = await pg.connect();
        await conection.query('Select * from generos;')
            .then((data) => {
                res.json(data.rows);
            })
            .catch((err) => {
                console.log(err);
            });
        conection.release();
    },
    insert: async (req, res) => {
        try {
            const { nombre, apellido, genero, fecha_n, avatar, usuario, contraseña, correo, registro_sistema } = req.body;
            const random = Math.floor(Math.random() * 30);
            let cry = await encrypt.hash(contraseña, random);
            let conection = await pg.connect();
            await conection.query('INSERT INTO usuarios (nombre, apellido, genero, fecha_n, edad, avatar, usuario, contraseña, correo, registro_sistema) VALUES($1, $2, $3, DATE($4), edad_usuarios(DATE($4)), $5, $6, $7, $8, $9) returning (id, edad)', [nombre, apellido, genero, fecha_n, avatar, usuario, cry, correo, registro_sistema])
                .then((data) => {
                    conection.release();
                    let id = data.rows[0].id;
                    let edad = data.rows[0].edad;
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
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    start: async (req, res) => {
        const { usuario_correo, contraseña } = req.body;
        let conection = await pg.connect();
        await conection.query('SELECT * FROM usuarios WHERE usuario= $1 OR correo= $1', [usuario_correo])
            .then(async (data) => {
                conection.release();
                if (data.rows[0]) {
                    const cry = await encrypt.compare(contraseña, data.rows[0].contraseña);
                    if (cry) {
                        let jsonData = data.rows[0];
                        let token = jwt.sign(jsonData, "26-02-2021");
                        res.json({ token, status: true })
                    } else {
                        res.json({ status: false, err: "The password is invalid" });
                    }
                } else {
                    res.json({ status: false, err: "User/email not exist" });
                }
            })
            .catch((err) => {
                res.json({ status: false, err });
                console.log(err);
            })
        
    },
    token_verify: async (req, res) => {
        let {token} = req.params;
        jwt.verify(token, "26-02-2021", async (err, data) => {
            if (err) {
                res.json({ validation: false });
            } else {
                res.json(data);
            }
        });
    }
}

module.exports = controller;