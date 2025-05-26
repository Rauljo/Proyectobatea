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
        const { name, polygon, row, col} = req.body;
        const newBatea = await pool.query("INSERT INTO bateas (name, polygon, row_sector, col_sector) VALUES($1, $2, $3, $4) RETURNING *", [name, polygon, row, col]);
        res.json(newBatea.rows[0]);

        //We also add as many sectors as the user wants
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                const newSector = await pool.query("INSERT INTO sectores (row, col, batea, cuerdas_pesca, cuerdas_piedra, cuerdas_desdoble, cuerdas_comercial) VALUES($1, $2, $3, 0, 0, 0, 0) RETURNING *", [i, j, newBatea.rows[0].id]);
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
        const { row, col, batea, tipo_cuerda, cantidad, tipo_operacion, nota } = req.body;

        console.log(req.body);

        let newMovimiento;

        //Check if nota contains 'nota' contains the word 'Intercambio' and if tipo_operacion is 'entrada'
        if (nota && nota.toLowerCase().includes('intercambio') && tipo_operacion === 'entrada') {
            console.log("AJHAJAJAJA");
            //nota will have the follwowing format: 'Intercambio con Batea id en sector (row, col)'. I want to obtain id, row and col
            console.log("NOTA", nota);
            const regex = /Intercambio con Batea (\d+) en \((\d+), (\d+)\)/;
            const match = nota.match(regex);
            console.log("MATCH", match);
            if (match) {
                req.batea_previa = parseInt(match[1]);
                req.row_intercambio = parseInt(match[2])-1;
                req.col_intercambio = parseInt(match[3])-1;

                console.log("HOLA", req.batea_previa, req.row_intercambio, req.col_intercambio);

                const movimientoPrevio = await pool.query(`
                    SELECT COALESCE(fecha_previa, fecha) as fecha FROM movimientos
                    WHERE sector_row = $1 AND sector_col = $2 AND sector_batea = $3
                    AND operacion = 'entrada' AND tipo_cuerda = $4
                    ORDER BY fecha DESC LIMIT 1`, //TODO: RESOLVER PROBLEMAS CON ZONAS TEMPORALES... 
                    [req.row_intercambio, req.col_intercambio, req.batea_previa, tipo_cuerda]
                );

                //TODO: COMPROBAR QUE HAYA CUERDAS DE LAS QUE SE QUIERE QUITAR... PARA HACER LOS MOVIMIENTOS... 

                if (movimientoPrevio.rows.length > 0) {
                    console.log("Movimiento previo encontrado:", movimientoPrevio.rows[0]);
                } else {
                    console.log("No se encontró movimiento previo");
                }

                const fecha_previa = movimientoPrevio.rows.length > 0 ? movimientoPrevio.rows[0].fecha : null;

                
                //fecha_previa of this movement will be the date of the last movement of the same tipo_cuerda and tipo_operacion = 'entrada' in the other batea
                newMovimiento = await pool.query(`
                    INSERT INTO movimientos (
                        tipo_cuerda, cantidad, operacion, sector_row, sector_col, sector_batea, fecha_previa, nota
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *`,
                    [tipo_cuerda, cantidad, tipo_operacion, row, col, batea, fecha_previa, nota || '']
                );
            }
        }
        else{
            newMovimiento = await pool.query(`
                INSERT INTO movimientos (tipo_cuerda, cantidad, operacion, sector_row, sector_col, sector_batea, nota)
                VALUES($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [tipo_cuerda, cantidad, tipo_operacion, row, col, batea, nota || '']
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

//Get limit alerts
app.get("/alerts/:limit", async (req, res) => {
    try {
        const { limit } = req.params;
        const alerts = await pool.query(`
            SELECT b.name, m.id, tipo_cuerda, cantidad, operacion, vigente, sector_row, sector_col, fecha, fecha_previa, nota, vigente, now() - COALESCE(fecha_previa, fecha) as vigencia
            FROM movimientos m join bateas b on m.sector_batea = b.id
            WHERE m.vigente = true
            ORDER BY vigencia DESC, id DESC
            LIMIT $1`,[limit]);
        
        res.json(alerts.rows);
    } catch (err) {
        console.error(err.message);
    }
}
);
    

app.listen(5010, () => {
    console.log('Server is running on port 5010');
});