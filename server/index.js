require ('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const pool = require('./db');

const authMiddleware = require('./authMiddleware');



//app.use(cors());
const allowedOrigins = [
    'http://localhost:3000',
    'https://proyectobatea.pages.dev'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'], // Importante para tokens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(authMiddleware);

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
        const { name, zona, polygon, cuadrante, distrito, row, col} = req.body;
        const newBatea = await pool.query("INSERT INTO bateas (name, zona, polygon, cuadrante, distrito, row_sector, col_sector) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *", [name, zona, polygon, cuadrante, distrito, row, col]);
        res.json(newBatea.rows[0]);

        //We also add as many sectors as the user wants
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                const newSector = await pool.query("INSERT INTO sectores (row, col, batea, cuerdas_pesca, cuerdas_cria, cuerdas_desdoble, cuerdas_reparque) VALUES($1, $2, $3, 0, 0, 0, 0) RETURNING *", [i, j, newBatea.rows[0].id]);
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

//Insert movement based on row, col and batea
app.post("/movimientos", async (req, res) => {
    try {
        const { row, col, batea, tipo_cuerda, cantidad, tipo_operacion, nota, fecha } = req.body;


        let newMovimiento;

        //Check if nota contains 'nota' contains the word 'Intercambio' and if tipo_operacion is 'entrada. Then we will determine fecha_previa
        if (nota && nota.toLowerCase().includes('intercambio') && tipo_operacion === 'entrada') {
            //nota will have the follwowing format: 'Intercambio con Batea id en sector (row, col)'. I want to obtain id, row and col
            const regex = /Intercambio con Batea (.+) \((\d+)\) en \((\d+), (\d+)\)/;
            const match = nota.match(regex);
            if (match) {
                req.batea_previa = parseInt(match[2]);
                req.row_intercambio = parseInt(match[3])-1;
                req.col_intercambio = parseInt(match[4])-1;


                const movimientoPrevio = await pool.query(`
                    SELECT COALESCE(fecha_previa, fecha) as fecha FROM movimientos
                    WHERE sector_row = $1 AND sector_col = $2 AND sector_batea = $3
                    AND operacion = 'entrada' AND tipo_cuerda = $4
                    ORDER BY fecha DESC LIMIT 1`, //TODO: RESOLVER PROBLEMAS CON ZONAS TEMPORALES... 
                    [req.row_intercambio, req.col_intercambio, req.batea_previa, tipo_cuerda]
                );




                const fecha_previa = movimientoPrevio.rows.length > 0 ? movimientoPrevio.rows[0].fecha : null;

                
                //fecha_previa of this movement will be the date of the last movement of the same tipo_cuerda and tipo_operacion = 'entrada' in the other batea
                newMovimiento = await pool.query(`
                    INSERT INTO movimientos (
                        tipo_cuerda, cantidad, operacion, sector_row, sector_col, sector_batea, fecha_previa, nota, fecha
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, now()))
                    RETURNING *`,
                    [tipo_cuerda, cantidad, tipo_operacion, row, col, batea, fecha_previa, nota || '', fecha || null]
                );
            }
        }
        else{
            newMovimiento = await pool.query(`
                INSERT INTO movimientos (tipo_cuerda, cantidad, operacion, sector_row, sector_col, sector_batea, nota, fecha)
                VALUES($1, $2, $3, $4, $5, $6, $7, COALESCE($8, now()))
                RETURNING *`,
                [tipo_cuerda, cantidad, tipo_operacion, row, col, batea, nota || '', fecha || null]
            );
        }     

        

        res.json(newMovimiento.rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.message.includes("No hay suficientes cuerdas")) {
            res.status(400).json({ error: err.message });
        }
        else{
            res.status(500).json({ error: "Error en el servidor" });
        }
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

app.get("/movimientos/:id", async (req, res) => {
    try {
        
        const { id } = req.params;
        const { vigencia } = req.query;

        if (vigencia === 'true') {
            queryText = `
                SELECT id, fecha, tipo_cuerda, cantidad, operacion, vigente, sector_row, sector_col, sector_batea, fecha_previa, nota, 
                CASE
                    WHEN operacion = 'entrada' THEN
                        CASE
                            WHEN vigente = true THEN now() - COALESCE(fecha_previa, fecha)
                            ELSE vigencia
                        END
                    ELSE vigencia
                END AS vigencia
                FROM movimientos WHERE sector_batea = $1
                ORDER BY fecha DESC, id DESC;
                `;
                queryParams = [id];
        }
        else {
            queryText = `
                SELECT * FROM movimientos WHERE sector_batea = $1
                ORDER BY fecha DESC, id DESC
                `;
                queryParams = [id];
        }

        const movimientos = await pool.query(queryText, queryParams);
        res.json(movimientos.rows);
    }
    catch (err) {
        console.error(err.message);

    }
}
);

// Cuerdas vigentes que superan el umbral de vigencia de su tipo,
// ordenadas por lo pasadas de plazo que van (convención: 1 mes = 30 días)
app.get("/alerts", async (req, res) => {
    try {
        const alerts = await pool.query(`
            SELECT b.id as batea_id, b.name, b.col_sector,
                   m.id, m.tipo_cuerda, m.cantidad, m.sector_row, m.sector_col,
                   now() - COALESCE(m.fecha_previa, m.fecha) as vigencia,
                   u.meses as umbral_meses
            FROM movimientos m
            JOIN bateas b ON m.sector_batea = b.id
            JOIN umbrales_vigencia u ON u.tipo_cuerda = m.tipo_cuerda
            WHERE m.vigente = true
              AND now() - COALESCE(m.fecha_previa, m.fecha) >= u.meses * interval '30 days'
            ORDER BY (now() - COALESCE(m.fecha_previa, m.fecha)) - u.meses * interval '30 days' DESC, m.id DESC`);

        res.json(alerts.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

//Get vigencia thresholds
app.get("/umbrales", async (req, res) => {
    try {
        const umbrales = await pool.query("SELECT * FROM umbrales_vigencia ORDER BY tipo_cuerda");
        res.json(umbrales.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

//Update a vigencia threshold
app.put("/umbrales/:tipo", async (req, res) => {
    try {
        const { tipo } = req.params;
        const { meses } = req.body;

        const mesesNum = parseInt(meses);
        if (isNaN(mesesNum) || mesesNum <= 0) {
            return res.status(400).json({ error: "meses debe ser un número mayor que 0" });
        }

        const updated = await pool.query(
            "UPDATE umbrales_vigencia SET meses = $1 WHERE tipo_cuerda = $2 RETURNING *",
            [mesesNum, tipo]
        );

        if (updated.rows.length === 0) {
            return res.status(404).json({ error: `Tipo de cuerda desconocido: ${tipo}` });
        }

        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error en el servidor" });
    }
});


app.listen(5010, () => {
    console.log('Server is running on port 5010');
});