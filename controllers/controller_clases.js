const pg = require('./../db/db');
const jwt = require('jsonwebtoken');
const pdf = require('html-pdf');
const xlsx = require('node-xlsx');
require('dotenv').config();
const controller = {
    /*Crear, editar y borrar clase*/
    insert: async (req, res) => {
        try {
            const { titulo, token, auto_u } = req.body;
            const dataToken = await jwt.verify(token, process.env.JWB_PASSWORD);
            let conection = await pg.connect();
            await conection.query(`CALL pa_insert_clase($1,$2,$3)`, [titulo, dataToken.id, auto_u])
                .then((data) => {
                    conection.release();
                    let jsonData = data.rows[0];
                    res.json({ jsonData, status: true });
                })
                .catch((err) => {
                    res.json({ status: false, err: err });
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
                    res.json({ status: false, err });
                    console.log(err);
                });
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    /*Traer las clases dependiendo de la pagina*/
    get_credas: async (req, res) => {
        try {
            const { token } = req.params;
            const dataToken = await jwt.verify(token, process.env.JWB_PASSWORD);
            let conection = await pg.connect();
            await conection.query(`SELECT clases.id, clases.titulo, clases.cont_usuarios, clases.fecha_c FROM clases WHERE clases.id_creador= $1`, [dataToken.id])
                .then((data) => {
                    conection.release();
                    let jsonData = data.rows[0];
                    res.json({ status: true, jsonData })
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
                    res.json({ status: false, err });
                    console.log(err);
                });
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    /*Generación de informes*/
    get_informe: async (req, res) => {
        try {
            const { id_clase, id_curso } = req.params;
            let conection = await pg.connect();
            await conection.query(`
            select usuario_clase.id_clase , primerJoin.id_usuario, primerJoin.calificacion, count(*) as unidades_r, primerJoin.cant_unidades, primerJoin.nombre from usuario_clase  left join (
                select  ucc.id_curso, ucc.id_usuario, ucc.calificacion, cursos.cant_unidades ,concat(usuarios.nombre, ' ', usuarios.apellido) as nombre from usuario_calificacion_curso as ucc 
                join cursos on ucc.id_curso = cursos.id join usuarios on usuarios.id = ucc.id_usuario where cursos.id_clase = $1 and cursos.id = $2
                ) as primerJoin  ON usuario_clase.id_usuario = primerJoin.id_usuario 
                join (
                    select unidades.id_curso, ucu.id_usuario, unidades.id as id_unidad from unidades join usuario_calificacion_unidad as ucu on unidades.id = ucu.id_unidad where unidades.id_curso = $2 and ucu.calificacion notnull
                ) as segundoJoin on segundoJoin.id_curso = primerJoin.id_curso and segundojoin.id_usuario = primerJoin.id_usuario
                WHERE usuario_clase.id_clase = $1 and usuario_clase.rol = 1 group by  usuario_clase.id_clase, primerJoin.id_usuario, primerJoin.calificacion, primerJoin.cant_unidades,primerJoin.nombre;
                
            `, [id_clase, id_curso])
                .then((data) => {
                    conection.release();
                    res.json({ jsonData: data.rows, status: true });
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
    pdf_informe: async (req, res) => {
        try {
            const { id_clase, id_curso, titulo } = req.params;
            let conection = await pg.connect();
            await conection.query(`select usuario_clase.id_clase , primerJoin.id_usuario, primerJoin.calificacion, count(*) as unidades_r, primerJoin.cant_unidades, primerJoin.nombre from usuario_clase  left join (
                select  ucc.id_curso, ucc.id_usuario, ucc.calificacion, cursos.cant_unidades ,concat(usuarios.nombre, ' ', usuarios.apellido) as nombre from usuario_calificacion_curso as ucc 
                join cursos on ucc.id_curso = cursos.id join usuarios on usuarios.id = ucc.id_usuario where cursos.id_clase = $1 and cursos.id = $2
                ) as primerJoin  ON usuario_clase.id_usuario = primerJoin.id_usuario 
                join (
                    select unidades.id_curso, ucu.id_usuario, unidades.id as id_unidad from unidades join usuario_calificacion_unidad as ucu on unidades.id = ucu.id_unidad where unidades.id_curso = $2 and ucu.calificacion notnull
                ) as segundoJoin on segundoJoin.id_curso = primerJoin.id_curso and segundojoin.id_usuario = primerJoin.id_usuario
                WHERE usuario_clase.id_clase = $1 and usuario_clase.rol = 1 group by  usuario_clase.id_clase, primerJoin.id_usuario, primerJoin.calificacion, primerJoin.cant_unidades,primerJoin.nombre;
                `, [id_clase, id_curso])
                .then((dataQuery) => {
                    conection.release();
                    let dataNull = dataQuery.rows.filter(Esito => Esito.calificacion == null);
                    let dataTer = dataQuery.rows.filter(Esito => Esito.unidades_r == Esito.cant_unidades);
                    let dataIni = dataQuery.rows.filter(Esito => Esito.unidades_r != Esito.cant_unidades);
                    let content =
                        `<!doctype html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Informe de la clase</title>
                        <style>
                        </style>
                    </head>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">
                        <div id="pageHeader" style="padding-bottom: 0.5cm;border-bottom: 1px solid black;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">
                            <h1> `+titulo+`</h1>
                            <img style="width:2cm; height:2cm; position: absolute; top: 0; left: 17cm" src="https://1.bp.blogspot.com/-eXfP9XUmzHc/X02wni0s3dI/AAAAAAAAPPo/Oj9XbD4WIpgvdS_jmAkJc32Z1vOnUzTXwCLcBGAsYHQ/s16000/LogoP.png" />
                        </div>
                        <div>
                        <h2 style="padding-top: 0.2cm">
                            Reporte general sobre los usuarios que realizaron el curso `+ titulo + `.   
                        </h2>`;
                    if (dataNull.length != 0) {
                        content = content + `
                        <center>
                            <h3>Usuarios que no han iniciado el curso: </h3>
                            <table border= "1px solid #ddd" style="border-collapse: collapse">
                            <tr>
                                <th style="padding-right:0.5cm"> Nombre </th>
                            </tr>`;
                        for (let i = 0; i < dataNull.length; i++) {
                            content = content + `
                                <tr>
                                    <td style="padding-right:0.5cm">`+ dataNull[i].nombre + `</td>
                                </tr>`;
                        }
                        content = content + "</table></center>"
                    }
                    if (dataIni.length != 0) {
                        content = content + `
                            <center>
                            <h3>Usuarios que no han terminado el curso: </h3>
                            <table border= "1px solid #ddd" style="border-collapse: collapse">
                            <tr>
                                <th style="padding-right:0.5cm"> Nombre </th>
                                <th style="padding-right:0.5cm"> Calificación actual</th>
                            </tr>`;
                        for (let i = 0; i < dataIni.length; i++) {
                            content = content + `
                                <tr>
                                    <td style="padding-right:0.5cm">`+ dataIni[i].nombre + `</td>
                                    <td style="padding-right:0.5cm">` + dataIni[i].calificacion + `</td>
                                </tr>`;
                        }
                        content = content + '</table></center>'
                    }
                    if (dataTer.length != 0) {
                        content = content + `
                            <center>
                            <h3>Usuarios que ya terminaron el curso: </h3>
                            <table border= "1px solid #ddd "style=" border-collapse: collapse">
                            <tr>
                                <th style="padding-right:0.5cm"> Nombre </th>
                                <th style="padding-right:0.5cm"> Calificación final</th>
                            </tr>`;
                        for (let i = 0; i < dataTer.length; i++) {
                            content = content + `
                                <tr>
                                    <td style="padding-right:0.5cm">`+ dataTer[i].nombre + `</td>
                                    <td style="padding-right:0.5cm">` + dataTer[i].calificacion + `</td>
                                </tr>`;
                        }
                        content = content + '</table></center>'
                    }

                    content = content + `</div>
                    <div  id="pageFooter" style="border-top: 1px solid black; padding-top: 10px;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"">
                    <h4>Learn With Us </h4>
                </div></body></html>`;
                    let options = {
                        format: 'Latter',
                        header: {
                            height: '5cm'
                        },
                        footer: {
                            height: '1cm'
                        },
                        border: '1cm'
                    }
                    pdf.create(content, options).toBuffer(async (err, respuesta) => {
                        if (err) {
                            res.json({ status: false, err: err });
                            console.log(err);
                        } else {
                            res.type('pdf');
                            res.end(respuesta, 'binary');
                        }
                    });
                })
                .catch((err) => {
                    res.json({ status: false, err: err });
                    console.log(err);
                })
        } catch (err) {
            res.json({ status: false, err: err });
            console.log(err);
        }
    },
    xlsx_informe: async (req,res) =>{
        try{
            const {id_clase, id_curso} = req.params;
            let conection = await pg.connect();
            await conection.query(`select usuario_clase.id_clase , primerJoin.id_usuario, primerJoin.calificacion, count(*) as unidades_r, primerJoin.cant_unidades, primerJoin.nombre from usuario_clase  left join (
                select  ucc.id_curso, ucc.id_usuario, ucc.calificacion, cursos.cant_unidades ,concat(usuarios.nombre, ' ', usuarios.apellido) as nombre from usuario_calificacion_curso as ucc 
                join cursos on ucc.id_curso = cursos.id join usuarios on usuarios.id = ucc.id_usuario where cursos.id_clase = $1 and cursos.id = $2
                ) as primerJoin  ON usuario_clase.id_usuario = primerJoin.id_usuario 
                join (
                    select unidades.id_curso, ucu.id_usuario, unidades.id as id_unidad from unidades join usuario_calificacion_unidad as ucu on unidades.id = ucu.id_unidad where unidades.id_curso = $2 and ucu.calificacion notnull
                ) as segundoJoin on segundoJoin.id_curso = primerJoin.id_curso and segundojoin.id_usuario = primerJoin.id_usuario
                WHERE usuario_clase.id_clase = $1 and usuario_clase.rol = 1 group by  usuario_clase.id_clase, primerJoin.id_usuario, primerJoin.calificacion, primerJoin.cant_unidades,primerJoin.nombre;
                `, [id_clase, id_curso])
                .then((dataQuery) =>{
                    conection.release();
                    let dataNull = dataQuery.rows.filter(Esito => Esito.calificacion == null);
                    let dataTer = dataQuery.rows.filter(Esito => Esito.unidades_r == Esito.cant_unidades);
                    let dataIni = dataQuery.rows.filter(Esito => Esito.unidades_r != Esito.cant_unidades);
                    let dataNull2 = [], dataTer2 = [], dataIni2 = [], datafinal = [];
                    if(dataNull.length != 0){
                        dataNull2[0] = [nombre = "Nombre"];
                        for(let i = 0; i < dataNull.length; i++){
                            dataNull2[i + 1]= [
                                nombre = dataNull[i].nombre,
                            ];
                        }
                        let variable = {name: "Sin iniciar", data: dataNull2};
                        datafinal.push(variable);
                    }
                    if(dataIni.length != 0){
                        dataIni2[0] = [nombre = "Nombre", calificacion = "Calificación"];
                        for(let i = 0; i < dataIni.length; i++){
                            dataIni2[i + 1]= [
                                nombre = dataIni.nombre,
                                calificacion = dataIni.calificacion
                        ];
                        }
                        let variable = {name: "Sin terminar", data: datIni2};
                        datafinal.push(variable)
                    }
                    if(dataTer.length != 0){
                        dataTer2[0] = [nombre = "Nombre", calificacion = "Calificación"];
                        for(let i = 0; i < dataTer.length; i++){
                            dataTer2[i + 1]= [
                                nombre = dataTer[i].nombre,
                                calificacion = dataTer[i].calificacion
                            ];
                        }
                        let variable = {name: "Terminados", data: dataTer2};
                        datafinal.push(variable)
                    }                 
                    var buffer = xlsx.build(datafinal);
                    res.type('xlsx');
                    res.end(buffer, 'binary');
                })
                .catch((err) =>{
                    res.json({status:false, err: err});
                    console.log(err);
                })
        }catch(err){
            res.json({status:false, err:err});
            console.log(err);
        }
    }
}
module.exports = controller;