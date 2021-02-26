const express = require('express');
const router = express.Router();
const pg = require('./../db/db').pool;
// Objeto de Guia
router.get("/", async (req, res) => {
    await pg.connect();
    let x= await pg.query('Select * from generos;').catch((err)=>{console.log(err)});
    pg.end();
    res.json(x);
});
module.exports = router;