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



app.listen(5010, () => {
    console.log('Server is running on port 5010');
});