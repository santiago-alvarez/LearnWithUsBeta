const pg = require('./../db/db');
const jwt = require('jsonwebtoken');
const controller = {
    insert: async (req, res) => {
        try {
            const { token, id_clase } = req.body;
            jwt.verify(token, "26-02-2021", async (err, dataToken) => {
                let conection = await pg.connect();
                await conection.query(`CALL pa_insert_usuarioclase($1,$2);`, [dataToken.id, id_clase])
                    .then((data) => {
                        conection.release();
                        res.json({ status: true });
                    })
                    .catch((err) => {
                        conection.release();
                        res.json({ status: false, err });
                        console.log(err);
                    });
            });
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    info_name: async (req, res) => {
        try {
            const { id_clase } = req.params;
            let conection = await pg.connect();
            await conection.query(`SELECT CONCAT(usuarios.nombre,' ', usuarios.apellido) AS nombre, usuarios.id FROM usuario_clase JOIN usuarios ON usuario_clase.id_usuario = usuarios.id WHERE usuario_clase.id_clase = $1;`, [id_clase])
                .then((data) => {
                    conection.release();
                    let jsonData = data.rows[0];
                    res.json({ status: true, jsonData });
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
    delete: async (req, res) => {
        try {
            const { id_clase, token } = req.params;
            jwt.verify(token, "26-02-2021",async (err, dataToken) => {
                let conection = await pg.connect();
                await conection.query('call pa_delete_usuarioclase($1,$2)', [id_clase, dataToken.id])
                    .then((data) => {
                        conection.release();
                        res.json({ status: true });
                    })
                    .catch((err) => {
                        conection.release();
                        res.json({ status: false, err });
                        console.log(err);
                    });
            });
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    }
}
module.exports = controller;