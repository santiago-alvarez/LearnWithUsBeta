const pg = require('./../db/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const controller = {
    /*Crear curso*/
    insert: async (req, res) => {
        try {
            const { token, id_clase, titulo, materia } = req.body;
            jwt.verify(token, process.env.JWB_PASSWORD, async (err, dataToken) => {
                let conection = await pg.connect();
                await conection.query('INSERT INTO cursos (id_creador, id_clase, titulo, materia) VALUES ($1,$2,$3,$4) RETURNING id', [dataToken.id, id_clase, titulo, materia])
                    .then((data) => {
                        conection.release();
                        res.json({ id: data.rows[0].id, status: true });
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
    /*Edición de un curso*/
    update_info: async (req, res) => {
        try {
            const { titulo, materia, id } = req.body;
            let conection = await pg.connect();
            await conection.query('UPDATE cursos SET titulo=$1, materia=$2 WHERE id=$3', [titulo, materia, id])
                .then((data) => {
                    conection.release();
                    res.json({ status: true });
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
    update_privacidad: async (req, res) => {
        try {
            const { privacidad, id } = req.body;
            let query;
            if (privacidad) {
                query = 'UPDATE cursos SET privacidad=$1, fecha_p = null WHERE id=$2';
            } else {
                query = 'UPDATE cursos SET privacidad=$1, fecha_p = fc_fecha_actual() WHERE id=$2';
            }
            let conection = await pg.connect();
            await conection.query(query, [privacidad, id])
                .then((data) => {
                    conection.release();
                    res.json({ status: true });
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
    /*Borrar elementos de un curso*/
    delete: async (req,res) =>{
        try{
            const {id} = req.body;
            let conection = await pg.connect();
            await conection.query('DELETE FROM cursos WHERE id=$1', [id])
            .then((data) =>{
                res.json({status: true})
            })
            .catch((err) =>{
                res.json({status:false, err:err});
            })
        }catch(err){
            res.json({status:false, err:err});
            console.log(err);
        }
    },
    /*Traer los cursos dependiendo de las paginas*/
    get_comunidad_integrado: async (req, res) => {
        try {
            const { categoria } = req.body;
            let conection = await pg.connect();
            await conection.query(`SELECT cursos.*, CONCAT(usuarios.nombre,' ',usuarios.apellido) as nombreCompleto, usuarios.id as id_usuario from cursos LEFT JOIN usuarios ON cursos.id_creador = usuarios.id WHERE categoria= $1 AND privacidad = false`, [categoria])
                .then((data) => {
                    conection.release();
                    let jsonData = data.rows;
                    res.json({ jsonData, status: true });
                })
                .catch((err) => {
                    res.json({ status: false, err });
                    console.log(err);
                })
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    get_iniciados: async (req, res) => {
        try {
            const { token } = req.body;
            jwt.verify(token, process.env.JWB_PASSWORD, async (err, dataToken) => {
                let conection = await pg.connect();
                await conection.query(`
                SELECT cursos.*, CONCAT(usuarios.nombre, ' ', usuarios.apellido) as nombreCreador from cursos
                join usuarios on cursos.id_creador  = usuarios.id
                join usuario_calificacion_curso on usuario_calificacion_curso.id_curso = cursos.id 
                where usuario_calificacion_curso.id_usuario = $1;`, [dataToken.id])
                    .then((data) => {
                        conection.release();
                        res.json({ dataJson: data.rows, status: true });
                    })
                    .catch((err) => {
                        res.json({ status: false, err: err });
                        console.log(err);
                    });
            });
        } catch (er) {
            res.json({ status: false, err: err });
            console.log(err);
        }
    },
    get_terminados: async(req,res) =>{
        try{
            const {token} = req.body;
            const dataToken = await jwt.verify(token, process.env.JWB_PASSWORD);
            let conection = await pg.connect();
            await conection.query(`
            select cursos.*, CONCAT(usuarios.nombre, ' ', usuarios.apellido) as nombreCreador from cursos 
            join usuarios on cursos.id_creador = usuarios .id
            join usuario_calificacion_curso as ucc on ucc.id_curso = cursos.id
            join (select id_curso , count(*) as conteo_unidades from unidades 
            join usuario_calificacion_unidad as ucu on unidades.id = ucu.id_unidad 
            where ucu.calificacion notnull and ucu.id_usuario= $1 group by unidades.id_curso
            ) as unidadesjoin on unidadesjoin.id_curso = cursos.id and unidadesjoin.conteo_unidades = cursos.cant_unidades 
            where ucc.id_usuario = $1;`, [dataToken.id])
            .then((data) => { 
                console.log(data)
                conection.release();
                res.json({status:true, jsonData: data.rows});
            })
            .catch((err) =>{
                res.json({status:false, err:err});
                console.log(err);
            })
        }catch(err){
            res.json({status:false, err:err});
            console.log(err);
        }
    },
    get_creados: async (req, res) => {
        try {
            const { token, id_otro_usuario, caso } = req.body;
            let parametro = 0;
            if (!caso) {
                parametro = id_otro_usuario;
            } else {
                parametro = await jwt.verify(token, process.env.JWB_PASSWORD).id;
            }
            let conection = await pg.connect();
            await conection.query('SELECT * FROM cursos WHERE id_creador=$1;', [parametro])
                .then((data) => {
                    conection.release();
                    res.json({ status: true, jsonData: data.rows })
                })
                .catch((err) => {
                    res.json({ status: false, err: err });
                    console.log(err);
                });
        } catch (err) {
            res.json({ status: false, err: err });
            console.log(err);
        }
    },
    get_cursos_clase: async (req, res) => {
        try {
            const { id_clase } = req.params;
            let conection = await pg.connect();
            await conection.query("SELECT * FROM cursos WHERE id_clase= $1", [id_clase])
                .then((data) => {
                    conection.release();
                    jsonData = data.rows[0];
                    res.json({ jsonData, status: true });
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
    /*Interacción de cursos con clases*/
    move_curso_clase: async (req, res) => {
        try {
            const { id_clase, id_curso, caso } = req.body;
            let conection = await pg.connect();
            await conection.query('SELECT fc_move_curso($1,$2,$3);', [id_clase, id_curso, caso])
                .then((data) => {
                    conection.release();
                    res.json({ status: data.rows[0].fc_move_curso });
                })
                .catch((err) => {
                    res.json({ status: false, err: err });
                });
        } catch (err) {
            res.json({ status: false, err: err });
            console.log(err);
        }
    }
}
module.exports = controller;