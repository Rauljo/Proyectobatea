import { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { BASE_ENDPOINT } from '../endpoint';
import { useSession } from '../context/SessionContext';


const formatInterval = (vigencia) => {
  if (!vigencia) return '';

  const days = vigencia.days ?? 0;
  const hours = String(vigencia.hours ?? 0).padStart(2, '0');
  const minutes = String(vigencia.minutes ?? 0).padStart(2, '0');
  const seconds = String(vigencia.seconds ?? 0).padStart(2, '0');

  return `${days}d ${hours}:${minutes}:${seconds}`;
};


const VisualizarMovimientos = ({batea}) => {

    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { session } = useSession();

    useEffect(() => {
        if (!batea) return;

        const fetchMovimientos = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${BASE_ENDPOINT}/movimientos/${batea.id}?vigencia=true`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                setMovimientos(response.data);
                console.log(response.data);
            } catch (error) {
                console.error(error.message);
            }
            setLoading(false);
        }

        fetchMovimientos();
    }
    , [batea, session]);

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
                        <TableCell><strong>Vigente</strong></TableCell>
                        <TableCell><strong>Vigencia</strong></TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {movimientos.map((movimiento) => (
                        <TableRow key={movimiento.id}>
                        <TableCell>{new Date(movimiento.fecha).toISOString().split('T')[0]}</TableCell>
                        <TableCell>{movimiento.sector_row+1}-{movimiento.sector_col+1}</TableCell>
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
                        <TableCell>
                            {movimiento.operacion === 'entrada' ? (
                                movimiento.vigente ? (
                                    <span style={{ color: "green", fontWeight: "bold" }}>Sí</span>
                                ) : (
                                    <span style={{ color: "red", fontWeight: "bold" }}>No</span>
                                )
                            ) : null}
                        </TableCell>
                        <TableCell>{formatInterval(movimiento.vigencia)}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}

export default VisualizarMovimientos;

