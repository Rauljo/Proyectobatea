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
                const newSector = await pool.query("INSERT INTO sectores (x, y, batea, cuerdas) VALUES($1, $2, $3, 0) RETURNING *", [i, j, newBatea.rows[0].id]);
            }
        }
    } catch (err) {
        console.error(err.message);
    }

});


app.listen(5010, () => {
    console.log('Server is running on port 5010');
});