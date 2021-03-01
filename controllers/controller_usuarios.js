const pg = require('../db/db');
const encrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const controller = {
    generos: async (req, res) => {
        try {
            let conection = await pg.connect();
            await conection.query('Select * from generos;')
                .then((data) => {
                    conection.release();
                    res.json(data.rows);
                })
                .catch((err) => {
                    conection.release();
                    res.json({ status: false, err });
                    console.log(err);
                });
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    insert: async (req, res) => {
        try {
            const { nombre, apellido, genero, fecha_n, avatar, usuario, contraseña, correo, registro_sistema } = req.body;
            const random = Math.round(Math.random() * 6, 5);
            console.log(random);
            await encrypt.hash(contraseña, random,async (err, cry) => {
                if (err) {
                    res.json({ status: false, err})
                    console.log(err);
                } else {
                    let conection = await pg.connect();
                    await conection.query('INSERT INTO usuarios (nombre, apellido, genero, fecha_n, edad, avatar, usuario, contraseña, correo, registro_sistema) VALUES($1, $2, $3, DATE($4), fc_edad_usuarios(DATE($4)), $5, $6, $7, $8, $9) returning (id, edad)', [nombre, apellido, genero, fecha_n, avatar, usuario, cry, correo, registro_sistema])
                        .then((data) => {
                            conection.release();
                            let id = data.rows[0].id;
                            let edad = data.rows[0].edad;
                            const jsonData = {
                                id, nombre, apellido, genero, fecha_n, edad, avatar, usuario, contraseña: cry, correo, registro_sistema
                            }
                            let token = jwt.sign(jsonData, "26-02-2021");
                            res.json({ token, status: true });
                        })
                        .catch((err) => {
                            conection.release();
                            res.json({ status: false, err });
                            console.log(err);
                        });
                }
            });
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    start: async (req, res) => {
        try {
            const { usuario_correo, contraseña } = req.body;
            let conection = await pg.connect();
            await conection.query('SELECT * FROM usuarios WHERE usuario= $1 OR correo= $1', [usuario_correo])
                .then(async (data) => {
                    conection.release();
                    if (data.rows[0]) {
                        const cry = await encrypt.compare(contraseña, data.rows[0].contraseña);
                        console.log(cry);
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
                    conection.release();
                    res.json({ status: false, err });
                    console.log(err);
                })
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    token_verify: async (req, res) => {
        let { token } = req.params;
        jwt.verify(token, "26-02-2021", async (err, data) => {
            if (err) {
                res.json({ validation: false });
            } else {
                res.json(data);
            }
        });
    },
    update: async (req, res) => {
        try {
            let { id, nombre, apellido, genero, fecha_n } = req.body;
            let query = "UPDATE usuarios SET nombre= $1, apellido= $2, genero= $3,fecha_n = DATE($4), edad = fc_edad_usuarios(DATE($4)) where id= $5 RETURNING *";
            let conection = await pg.connect();
            await conection.query(query, [nombre, apellido, genero, fecha_n, id])
                .then((data) => {
                    conection.release();
                    let token = jwt.sign(data.rows[0], "26-02-2021");
                    res.json({ token, status: true });
                }).catch((err) => {
                    conection.release();
                    res.json({ status: false, err });
                    console.log(err);
                })
        } catch (error) {
            res.json({ status: false, error });
            console.log(error);
        }
    }
}

module.exports = controller;