const pg = require('../db/db');
const encrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
/*Cloud storage*/
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const uuid = require('uuid');
const uuidv4 = uuid.v4;

/*Nodemailer*/
const smtpTransport = require('nodemailer-smtp-transport');
const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.CORREO,
        pass: process.env.PASS
    }
}));
const storage = new Storage({
    projectid: process.env.GCLOUD_PROJECT,
    credentials: {
        client_email: process.env.GCLOUD_CLIENT_EMAIL,
        private_key: process.env.GCLOUD_PRIVATE_KEY
    }
});
const bucket = storage.bucket(process.env.GCLOUD_BUCKET);

const controller = {
    /*Registro e inicio de sesión*/
    generos: async (req, res) => {
        try {
            let conection = await pg.connect();
            await conection.query('Select * from generos;')
                .then((data) => {
                    conection.release();
                    res.json(data.rows);
                })
                .catch((err) => {
                    res.json({ status: false, err:err });
                    console.log(err);
                });
        } catch (err) {
            res.json({ status: false, err:err });
            console.log(err);
        }
    },
    correo: async (req, res) => {
        try {
            const { codigo, usuario, correo } = req.body;
            fs.readFile('./src/email.html', 'utf8', (err, html) => {
                html = html.replace('$DontHere$2', usuario);
                const mailOptions = {
                    from: 'Learn With Us',
                    to: correo,
                    subject: 'Codigo de Verificacion',
                    html: html.replace('$replaceHere$', codigo)
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        res.json({ status: false, error: error });
                        console.log(error);
                    } else {
                        res.json({ status: true, info });
                    }
                });
            });
        } catch (err) {
            res.json({ status: false, err: err });
            console.log(err);
        }
    },
    insert: async (req, res) => {
        try {
            const { nombre, apellido, genero, fecha_n, avatar, usuario, contraseña, correo, registro_sistema } = req.body;
            const random = Math.round(Math.random() * 6, 5);
            await encrypt.hash(contraseña, random, async (err, cry) => {
                if (err) {
                    res.json({ status: false, err })
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
                            let token = jwt.sign(jsonData, process.env.JWB_PASSWORD);
                            res.json({ token, status: true });
                        })
                        .catch((err) => {
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
            await conection.query('SELECT * FROM usuarios WHERE (usuario= $1 OR correo= $1) AND activo=true', [usuario_correo])
                .then(async (data) => {
                    conection.release();
                    if (data.rows[0]) {
                        const cry = await encrypt.compare(contraseña, data.rows[0].contraseña);
                        console.log(cry);
                        if (cry) {
                            let jsonData = data.rows[0];
                            let token = jwt.sign(jsonData, process.env.JWB_PASSWORD);
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
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    get_info_registro: async (req, res) => {
        try {
            const { usuario, correo } = req.body;
            let conection = await pg.connect();
            conection.query('SELECT usuario, correo, activo FROM usuarios WHERE usuario=$1 OR correo=$2', [usuario, correo])
                .then((data) => {
                    conection.release();
                    res.json({ jsonData: data.rows, status: true });
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
    token_verify: async (req, res) => {
        let { token } = req.params;
        jwt.verify(token, process.env.JWB_PASSWORD, async (err, data) => {
            if (err) {
                res.json({ validation: false });
            } else {
                res.json(data);
            }
        });
    },
    /*Actualizar información*/
    update: async (req, res) => {
        try {
            let { id, nombre, apellido, genero, fecha_n } = req.body;
            let query = "UPDATE usuarios SET nombre= $1, apellido= $2, genero= $3,fecha_n = DATE($4), edad = fc_edad_usuarios(DATE($4)) where id= $5 RETURNING *";
            let conection = await pg.connect();
            await conection.query(query, [nombre, apellido, genero, fecha_n, id])
                .then((data) => {
                    conection.release();
                    let token = jwt.sign(data.rows[0], process.env.JWB_PASSWORD);
                    res.json({ token, status: true });
                }).catch((err) => {
                    res.json({ status: false, err });
                    console.log(err);
                })
        } catch (error) {
            res.json({ status: false, error });
            console.log(error);
        }
    },
    update_password: async (req, res) => {
        try {
            const { contraseña, id } = req.body;
            const random = Math.round(Math.random() * 6, 5);
            await encrypt.hash(contraseña, random, async (err, cry) => {
                let conection = await pg.connect();
                await conection.query('UPDATE usuarios SET contraseña=$1 WHERE id=$2 RETURNING *', [cry, id])
                    .then((data) => {
                        conection.release();
                        let jsonData = data.rows[0];
                        let token = jwt.sign(jsonData, process.env.JWB_PASSWORD);
                        res.json({ status: true, token });
                    })
                    .catch((err) => {
                        res.json({ status: false, err: err });
                        console.log(err);
                    });
            });
        } catch (err) {
            res.json({ status: false, err: err });
            console.log(err);
        }
    },
    upload_avatar: async (req, res) => {
        try {
            const { usuario, id } = req.body;
            const newFileName = "avatars/" + uuidv4() + id + "-" + usuario + "-avatar" + path.extname(req.file.originalname);
            const file = bucket.file(newFileName);
            const fileStream = await file.createWriteStream({
                resumable: false,
                qzip: true,
                public: true
            })
                .on('error', (err) => {
                    res.json({ status: false, err: err })
                    console.log(err);
                })
                .on('finish', async () => {
                    const publicURL = `https://storage.googleapis.com/${process.env.GCLOUD_BUCKET}/${file.name}`;
                    const dataAvatar = file.name;
                    let conection = await pg.connect();
                    await conection.query('UPDATE usuarios SET avatar=$1 WHERE id=$2 RETURNING *', [file.name, id])
                        .then((data) => {
                            conection.release();
                            let token = jwt.sign(data.rows[0], process.env.JWB_PASSWORD);
                            res.json({ status: true, token });
                        })
                        .catch((err) => {
                            res.json({ status: false, err: err });
                            console.log(err);
                        });
                });

            fileStream.end(req.file.buffer);
        } catch (err) {
            res.json({ status: false, err: err });
            console.log(err);
        }
    },
    delete_avatar: async (req, res) => {
        try {
            const { filename, id, caso } = req.body;
            const file = bucket.file(filename);
            file.delete();
            if (caso) {
                let conection = await pg.connect();
                await conection.query('UPDATE usuarios SET avatar= DEFAULT WHERE id=$1 RETURNING *', [id])
                    .then((data) => {
                        conection.release();
                        let token = jwt.sign(data.rows[0], process.env.JWB_PASSWORD);
                        res.json({ status: true, token });
                    })
                    .catch((err) => {
                        res.json({ status: false, err: err });
                        console.log(err);
                    });
            }
            res.json({ status: true });
        } catch (err) {
            res.json({ status: false, err: err });
            console.log(err);
        }
    },
    /*Borrado lógico*/
    activate_account: async (req, res) => {
        try {
            const { correo, usuario } = req.body;
            let conection = await pg.connect();
            await conection.query("UPDATE usuarios SET usuario=$1, activo=true WHERE correo=$2 RETURNING *", [usuario, correo])
                .then((data) => {
                    conection.release();
                    let jsonData = data.rows[0];
                    let token = jwt.sign(jsonData, process.env.JWB_PASSWORD);
                    res.json({ status: true, token });
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
    delete_account: async (req, res) => {
        try {
            const { id } = req.params;
            let conection = await pg.connect();
            await conection.query('UPDATE usuarios SET activo= false, usuario = null WHERE id=$1', [id])
                .then((data) => {
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
    /*Relación ||usuario-usuario|| seguidores*/
    get_all_users: async (req, res) => {
        try {
            const { offset } = req.params;
            let conection = await pg.connect();
            conection.query(`select  usuarios.id, concat(usuarios.nombre, ' ', usuarios.apellido) as nombre, usuarios.avatar, usuarios.usuario,usuarios.cant_seguidores , case when sc_cursos.cantidad_cursos is null then 0 else sc_cursos.cantidad_cursos end as CanCursos, case when sc_clases.cantidad_clases is null then 0 else sc_clases.cantidad_clases end as CanClases from usuarios 
            left join (select count(*) as cantidad_cursos, id_creador as id_creador_curso from cursos where privacidad = false group by id_creador) as sc_cursos on usuarios.id = sc_cursos.id_creador_curso 
            left join (select count(*) as cantidad_clases, id_creador as id_creador_clase from clases group by id_creador) as sc_clases on usuarios.id = sc_clases.id_creador_clase 
            where usuarios.activo  = true 
            order by usuarios.cant_seguidores desc,CanCursos desc, CanClases desc
            limit 100 offset $1;           
            `, [offset])
                .then((data) => {
                    conection.release();
                    res.json({ status: true, data: data.rows });
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
    follow: async (req, res) => {
        try {
            const { token, id_seguido } = req.body;
            jwt.verify(token, process.env.JWB_PASSWORD, async (err, dataToken) => {
                let conection = await pg.connect();
                await conection.query('CALL pa_insert_usuarioseguidor($1,$2)', [dataToken.id, id_seguido])
                    .then((data) => {
                        res.json({ status: true });
                    })
                    .catch((err) => {
                        res.json({ status: false, err: err });
                        console.log(err);
                    });
            });
        } catch (err) {
            res.json({ status: false, err: err });
            console.log(err);
        }
    },
    stop_following: async (req, res) => {
        try {
            const { token, id_seguido } = req.body;
            jwt.verify(token, process.env.JWB_PASSWORD, async (err, dataToken) => {
                let conection = await pg.connect();
                await conection.query('CALL pa_delete_usuarioseguidor($1,$2)', [dataToken.id, id_seguido])
                    .then((data) => {
                        res.json({ status: true });
                    })
                    .catch((err) => {
                        res.json({ status: false, err: err });
                        console.log(err);
                    });
            });
        } catch (err) {
            res.json({ status: false, err: err });
            console.log(err);
        }
    },
    user_info: async (req, res) => {
        try {
            const { id } = req.params;
            let conection = await pg.connect();
            conection.query("SELECT id, CONCAT(usuarios.nombre, ' ', usuarios.apellido) as nombre, edad, avatar, genero, usuario, cant_seguidores from usuarios WHERE id=$1", [id])
                .then((data) => {
                    conection.release();
                    res.json({ jsonData: data.rows[0], status: true });
                })
                .catch((err) => {
                    res.json({ status: false, err: err });
                    console.log(err);
                })
        } catch (err) {
            res.json({ status: false, err: err });
            console.log(err);
        }
    }
}

module.exports = controller;