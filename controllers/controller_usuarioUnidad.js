const pg = require('./../db/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const controller = {
    /*Iniciar una unidad*/
    insert: async (req, res) => {
        try {
            const { token, id_unidad } = req.body;
            const dataToken = await jwt.verify(token, process.env.JWB_PASSWORD);
            const conection = await pg.connect();
            conection.query('INSERT INTO usuario_calificacion_unidad (id_usuario, id_unidad) VALUES ($1,$2)', [dataToken.id, id_unidad])
                .then((data) => {
                    conection.release();
                    res.json({ status: true });
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