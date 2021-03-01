const pg = require('../db/db');
const encrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const smtpTransport = require('nodemailer-smtp-transport');
const nodemailer = require('nodemailer');
require('dotenv').config();
console.log(process.env.PASS);
console.log(process.env.CORREO);
let transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.CORREO,
        pass: process.env.PASS
    }
}));

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
    correo: async(req,res)=>{
        const { nombre, codigo, apellido, genero, fecha_n, avatar, usuario, contraseña, correo, registro_sistema }=req.body;
        const mailOptions = {
            from: 'Learn With Us',
            to: correo,
            subject: 'Codigo de Verificacion',
            html: `<!DOCTYPE html>

            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email - LearnWithUs</title>
                <style>
                    body {
                        text-align: center;
                        margin: 0;
                        padding: 0;
                        top: 0;
                        left: 0;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    }
            
                    .Main {
                        width: 100%;
                        height: 100vh;
                        display: flex;
                        flex-flow: column;
                        align-items: center;
                        justify-content: center;
                    }
            
                    .cargando {
                        background-image: url("https://1.bp.blogspot.com/-eXfP9XUmzHc/X02wni0s3dI/AAAAAAAAPPo/Oj9XbD4WIpgvdS_jmAkJc32Z1vOnUzTXwCLcBGAsYHQ/s16000/LogoP.png");
                        background-repeat: no-repeat;
                        background-position: center center;
                        background-size: 100%;
                        width: 15vw;
                        height: 15vw;
                        background-color: rgb(256, 256, 256);
                    }
            
                    h2 {
                        margin: 0;
                    }
            
                    .texto {
                        width: 40%;
                        text-align: center;
                    }
            
                    @media(max-width: 550px) {
                        .texto {
                            max-width: 90%;
            
                        }
            
                        .cargando {
                            width: 30vh;
                            height: 30vh;
                        }
                    }
            
                    @media(min-height: 730px) {
                        .texto {
                            font-size: 1em;
                        }
            
                        body {
                            font-size: 2em;
                        }
            
                        .cargando {
                            width: 30vh;
                            height: 30vh;
                        }
                    }
                </style>
            </head>
            
            <body>
                <div class="Main">
                    <p class="texto">Te estás registrando en nuestra pagina web, Learn with us, ingresa el código en la pagina para
                        continuar con el registo.</p>
                    <div class="cargando"></div>
                    <h2>Tu código de verificación es <br>Learn- </h2>
                    <p class="texto">Por favor no responda este correo, ya que se encarga únicamente de la difusión, si no es usted ignore este mensaje.</p>
                </div>
            </body>
            
            </html>`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.json({status:false,error });
                console.log(error);
            }else{
                res.json({status:true,info });
            }
        });
    },
    insert: async (req, res) => {
        try {
            const { nombre, apellido, genero, fecha_n, avatar, usuario, contraseña, correo, registro_sistema } = req.body;
            const random = Math.round(Math.random() * 6, 5);
            await encrypt.hash(contraseña, random,async (err, cry) => {
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
            await conection.query('SELECT * FROM usuarios WHERE usuario= $1 OR correo= $1 where activo=true', [usuario_correo])
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
    },
    delete: async (req, res) => {
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
    }
}

module.exports = controller;