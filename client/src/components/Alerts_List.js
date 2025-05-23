import React, { useState } from 'react';
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { BASE_ENDPOINT } from '../endpoint';

const formatInterval = (vigencia) => {
  if (!vigencia) return '';

  const days = vigencia.days ?? 0;
  const hours = String(vigencia.hours ?? 0).padStart(2, '0');
  const minutes = String(vigencia.minutes ?? 0).padStart(2, '0');
  const seconds = String(vigencia.seconds ?? 0).padStart(2, '0');

  return `${days}d ${hours}:${minutes}:${seconds}`;
};

const Alerts_List = () => {
  const [limit, setLimit] = useState('');
  const [alerts, setAlerts] = useState([]);

  const handleFetchAlerts = async () => {
    if (!limit || isNaN(limit)) {
      alert('Por favor introduce un número válido');
      return;
    }

    try {
      const response = await axios.get(`${BASE_ENDPOINT}/alerts/${limit}`);
      setAlerts(response.data);
    } catch (err) {
      console.error('Error al obtener alertas:', err);
      alert('Hubo un error al obtener los datos.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Alertas
      </Typography>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <TextField
          label="Límite"
          variant="outlined"
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleFetchAlerts}>
          Buscar
        </Button>
      </div>

      {alerts.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Batea</TableCell>
                <TableCell>Tipo cuerda</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Operación</TableCell>
                <TableCell>Sector</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Vigencia</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.tipo_cuerda}</TableCell>
                  <TableCell>{row.cantidad}</TableCell>
                  <TableCell>{row.operacion}</TableCell>
                  <TableCell>{`(${row.sector_row}, ${row.sector_col})`}</TableCell>
                  <TableCell>{new Date(row.fecha).toLocaleString()}</TableCell>
                  <TableCell>{formatInterval(row.vigencia)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default Alerts_List;
