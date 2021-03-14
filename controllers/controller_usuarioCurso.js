const pg = require('./../db/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const controller = {
    /*Iniciar un curso*/
    insert: async (req, res) => {
        try {
            const { token, id_curso } = req.params;
            jwt.verify(token, process.env.JWB_PASSWORD, async (err, dataToken) => {
                let conection = await pg.connect();
                await conection.query("INSERT INTO usuario_calificacion_curso (id_usuario, id_curso) VALUES ($1,$2)", [dataToken.id, id_curso])
                    .then((data) => {
                        conection.release();
                        res.json({ status: true });
                    })
                    .catch((err) => {
                        res.json({ status: false, err });
                        console.log(err);
                    });
            });
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    /*Procedimiento para valorar un curso*/
    update_valoracion_curso: async (req, res) => {
        try {
            const { id_curso, token, valoracion } = req.body;
            jwt.verify(token, process.env.JWB_PASSWORD, async (err, dataToken) => {
                let conection = await pg.connect();
                await conection.query(`CALL pa_insert_valoracioncurso($1, $2, $3); `, [id_curso, dataToken.id, valoracion])
                    .then((data) => {
                        conection.release();
                        res.json({ status: true });
                    })
                    .catch((err) => {
                        res.json({ status: false, err });
                        console.log(err);
                    });
            });
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    get_info_iniciado: async (req, res) => {
        try {
            const { token, id_curso } = req.body;
            const dataToken = await jwt.verify(token, process.env.JWB_PASSWORD);
            let conection = await pg.connect();
            conection.query(`select case when exists (
                            select * from usuario_calificacion_curso as ucc where id_curso = $1 and id_usuario = $2
                            ) then true else false end as boolean`, [id_curso, dataToken.id])
                .then((data) => {
                    conection.release();
                    res.json({ status: data.rows[0].boolean });
                })
                .catch((err) => {
                    res.json({ status: false, err: err });
                    console.log(err);
                });
        } catch (err) {
            res.json({ status: false, err: err });
            console.log(err);
        }
    }
}
module.exports = controller;