const pg = require('./../db/db');
const jwt = require('jsonwebtoken');
const controller = {
    insert: async (req, res) => {
        try {
            const { token, id_curso } = req.params;
            jwt.verify(token, "26-02-2021", async (err, dataToken) => {
                let conection = await pg.connect();
                await conection.query("INSERT INTO usuario_calificacion_curso (id_usuario, id_curso) VALUES ($1,$2)", [dataToken.id, id_curso])
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
    update_valoracion_curso: async (req, res) => {
        try {
            const { id_curso, token, valoracion } = req.body;
            jwt.verify(token, "26-02-2021", async (err, dataToken) => {
                let conection = await pg.connect();
                await conection.query(`CALL pa_insert_valoracioncurso($1, $2, $3); `, [id_curso, dataToken.id, valoracion])
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