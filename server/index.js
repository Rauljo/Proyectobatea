const express = require('express');
const app = express();
const cors = require('cors');

const pool = require('./db');

app.use(cors());
app.use(express.json());

//Get bateas
app.get("/bateas", async (req, res) => {
    try {
        const bateas = await pool.query("SELECT * FROM bateas");
        res.json(bateas.rows);
    } catch (err) {
        console.error(err.message);
    }
});


//Add bateas
app.post("/bateas", async (req, res) => {
    try {
        const { name, polygon, x, y} = req.body;
        const newBatea = await pool.query("INSERT INTO bateas (name, polygon, x_sector, y_sector) VALUES($1, $2, $3, $4) RETURNING *", [name, polygon, x, y]);
        res.json(newBatea.rows[0]);

        //We also add as many sectors as the user wants
        for (let i = 0; i < x; i++) {
            for (let j = 0; j < y; j++) {
                const newSector = await pool.query("INSERT INTO sectores (x, y, batea, cuerdas_pesca, cuerdas_piedra, cuerdas_desdoble, cuerdas_comercial) VALUES($1, $2, $3, 0, 0, 0, 0) RETURNING *", [i, j, newBatea.rows[0].id]);
            }
        }
    } catch (err) {
        console.error(err.message);
    }

});

//Get sectors of a batea
app.get("/sectores/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const sectores = await pool.query("SELECT * FROM sectores WHERE batea = $1", [id]);
        res.json(sectores.rows);
    } catch (err) {
        console.error(err.message);
    }
});

//Insert movement based on x, y and batea
app.post("/movimientos", async (req, res) => {
    try {
        const { x, y, batea, tipo_cuerda, cantidad, tipo_operacion } = req.body;
        const newMovimiento = await pool.query("INSERT INTO movimientos (tipo_cuerda, cantidad, operacion, sector_x, sector_y, sector_batea) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", 
            [tipo_cuerda, cantidad, tipo_operacion, x, y, batea]);
        res.json(newMovimiento.rows[0]);
    } catch (err) {
        console.error(err.message);
        //res.status(500).send("Error en el servidor");
    }
});

//Get batea information
app.get("/bateas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const batea = await pool.query("SELECT * FROM bateas WHERE id = $1", [id]);
        res.json(batea.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//Get batea movements
app.get("/movimientos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const movimientos = await pool.query("SELECT * FROM movimientos WHERE sector_batea = $1", [id]);
        res.json(movimientos.rows);
    } catch (err) {
        console.error(err.message);
    }
});


app.listen(5010, () => {
    console.log('Server is running on port 5010');
});