import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


const Visualizar_Movimientos = ({batea}) => {

    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!batea) return;

        const fetchMovimientos = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5010/movimientos/${batea.id}`);
                setMovimientos(response.data);
                console.log(response.data);
            } catch (error) {
                console.error(error.message);
            }
            setLoading(false);
        }

        fetchMovimientos();
    }
    , [batea]);

    return (
        <div>
            {loading && <p>Cargando...</p>}
            <h2>Movimientos de la batea {batea.name}</h2>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell><strong>Fecha</strong></TableCell>
                        <TableCell><strong>Sector</strong></TableCell>
                        <TableCell><strong>Tipo de cuerda</strong></TableCell>
                        <TableCell><strong>Cantidad</strong></TableCell>
                        <TableCell><strong>Operación</strong></TableCell>
                        <TableCell><strong>Fecha Previa</strong></TableCell>
                        <TableCell><strong>Nota</strong></TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {movimientos.map((movimiento) => (
                        <TableRow key={movimiento.id}>
                        <TableCell>{new Date(movimiento.fecha).toISOString().split('T')[0]}</TableCell>
                        <TableCell>{movimiento.sector_x+1}-{movimiento.sector_y+1}</TableCell>
                        <TableCell>{movimiento.tipo_cuerda}</TableCell>
                        <TableCell>{movimiento.cantidad}</TableCell>
                        <TableCell
                            sx={{
                                color: movimiento.operacion === "entrada" ? "green" : "red",
                                fontWeight: "bold"
                            }}
                            >
                            {movimiento.operacion}
                        </TableCell>
                        <TableCell>{movimiento.fecha_previa}</TableCell>
                        <TableCell>{movimiento.nota}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}

export default Visualizar_Movimientos;

