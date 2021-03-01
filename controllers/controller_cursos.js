const pg = require('./../db/db');
const controller = {
    insert: async (req, res) => {
        try {
            const { id_creador, id_clase, titulo, materia, logo } = req.body;
            let conection = await pg.connect();
            await conection.query('INSERT INTO cursos (id_creador, id_clase, titulo, materia, logo) VALUES ($1,$2,$3,$4,$5) RETURNING id', [id_creador, id_clase, titulo, materia, logo])
                .then((data) => {
                    conection.release();
                    res.json({ id: data.rows[0].id, status: true });
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
                    conection.release();
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
                    conection.release();
                    res.json({ status: false, err });
                    console.log(err);
                });
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
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
                    conection.release();
                    res.json({ status: false, err });
                    console.log(err);
                })
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    }
}
module.exports = controller;