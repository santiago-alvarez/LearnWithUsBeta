const pg = require('./../db/db');
const controller = {
    insert: async (req, res) => {
        try {
            const { titulo, id_creador, auto_u } = req.body;
            let conection = await pg.connect();
            await conection.query(`INSERT INTO clases (titulo, cont_usuarios, id_creador, fecha_c, auto_u) VALUES ($1, 1, $2, fc_fecha_actual(), $3) RETURNING id;`, [titulo, id_creador, auto_u])
                .then((data) => {
                    conection.release();
                    let jsonData = data.rows[0];
                    res.json({ jsonData, status: true });
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
    get_credas: async (req, res) => {
        try {
            const { id_creador } = req.params;
            let conection = await pg.connect();
            await conection.query(`SELECT * FROM clases WHERE clases.id_creador= $1`, [id_creador])
                .then((data) => {
                    conection.release();
                    let jsonData = data.rows[0];
                    res.json({ status: true, jsonData })
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
    get_inscritas: async (req, res) => {
        try {
            const { id_usuario } = req.params;
            let conection = await pg.connect();
            await conection.query('SELECT clases.id, clases.titulo, clases.cont_usuarios, usuario_clase.fecha_u FROM usuario_clase INNER JOIN clases ON usuario_clase.id_clase = clases.id WHERE id_usuario= $1', [id_usuario])
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
    update: async (req, res) => {
        try {
            const { titulo, id } = req.body;
            let conection = await pg.connect();
            await conection.query('UPDATE clases SET titulo=$1 WHERE id=$2', [titulo, id])
                .then((data) => {
                    conection.release();
                    res.json({ status: true });
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
            const { id } = req.params;
            let conection = await pg.connect();
            await conection.query('DELETE FROM clases WHERE id=$1', [id])
                .then((data) => {
                    conection.release();
                    res.json({ status: true });
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
                    conection.release();
                    res.json({ status: false, err });
                    console.log(err);
                });
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    get_informe: async (req, res) => {
        try {
            const { id_clase, id_curso } = req.params;
            let conection = await pg.connect();
            await conection.query(`select usuario_clase.id_clase , primerJoin.* from usuario_clase left join(select  usuario_calificacion_curso.id_curso, usuario_calificacion_curso.id_usuario, usuario_calificacion_curso.calificacion, concat(usuarios.nombre, ' ', usuarios.apellido) as nombre from usuario_calificacion_curso join cursos on usuario_calificacion_curso.id_curso = cursos.id join usuarios on usuarios.id = usuario_calificacion_curso.id_usuario where cursos.id_clase = $1 and cursos.id = $2) as primerJoin  ON usuario_clase.id_usuario = primerJoin.id_usuario WHERE usuario_clase.id_clase = $1;`, [id_clase, id_curso])
                .then((data) => {
                    res.json({ jsonData: data.rows, status: true });
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
    }
}
module.exports = controller;