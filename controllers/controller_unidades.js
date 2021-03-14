const pg = require('./../db/db');
const controller = {
    /*Crear, editar y borrar una unidad*/
    insert: async (req, res) =>{
        try{
            const {id_curso, titulo, tematica} = req.body;
            let conection = await pg.connect();
            await conection.query('CALL pa_insert_unidad($1, $2, $3);', [id_curso, titulo, tematica])
            .then((data) =>{
                conection.release();
                res.json({status:true});
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
    update: async (req, res) =>{
        try{
            const {titulo, tematica, id} = req.body;
            let conection = await pg.connect();
            await conection.query('UPDATE unidades SET titulo=$1, tematica=$2 WHERE id=$3',[titulo, tematica, id])
            .then((data) =>{
                conection.release();
                res.json({status:true});
            })
            .catch((err) =>{
                res.json({status:false, err:err});
                console.log(err);
            });
        }catch(err){
            res.json({status:false, err:err});
            console.log(err);
        }
    },
    delete: async (req,res) =>{
        try{
            const {id_unidad} = req.params;
            let conection = await pg.connect();
            conection.query('CALL pa_delete_unidad($1)', [id_unidad])
            .then((data) =>{
                conection.release();
                res.json({status:true});
            })
            .catch((err) =>{
                res.json({status:false, err:err});
                console.log(err);
            })
        }catch(err) {
            res.json({status:false, err:err});
            console.log(err);
        }
    }
}
module.exports = controller;