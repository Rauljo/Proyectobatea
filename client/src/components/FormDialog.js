import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import { BASE_ENDPOINT } from '../endpoint';
import { useSession } from '../context/SessionContext';

import axios from "axios";

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);

  const[name, setName] = React.useState("");
  const[zona, setZona] = React.useState("");
  const[polygon, setPolygon] = React.useState("");
  const[cuadrante, setCuadrante] = React.useState("");
  const[distrito, setDistrito] = React.useState("");
  const[row, setRow] = React.useState("");
  const[col, setCol] = React.useState("");
  const { session } = useSession();

  const rowNum = parseInt(row);
  const colNum = parseInt(col);
  const totalSectores = rowNum > 0 && colNum > 0 ? rowNum * colNum : null;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = { name, zona, polygon, cuadrante, distrito, row, col };

    try {
        const response = await axios.post(`${BASE_ENDPOINT}/bateas`, data,
            {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            }
        );

        if (response.status === 200 || response.status === 201) {
            window.location.reload();
        }
    } catch (error) {
        console.error(error.message);
    }

    };

  return (
    <React.Fragment>
      <Button variant="outlined" startIcon={<AddIcon />} onClick={handleClickOpen}>
        Añadir Batea
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: handleSubmit,
          },
        }}
      >
        <DialogTitle>Crear Nueva Batea</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>

            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Datos de registro
              </Typography>
              <TextField
                autoFocus
                required
                id="name"
                label="Nombre"
                type="text"
                fullWidth
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  required
                  id="zona"
                  label="Zona"
                  type="text"
                  fullWidth
                  value={zona}
                  onChange={(event) => setZona(event.target.value)}
                />
                <TextField
                  required
                  id="polygon"
                  label="Polígono"
                  type="text"
                  fullWidth
                  value={polygon}
                  onChange={(event) => setPolygon(event.target.value)}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  required
                  id="cuadrante"
                  label="Cuadrante"
                  type="text"
                  fullWidth
                  value={cuadrante}
                  onChange={(event) => setCuadrante(event.target.value)}
                />
                <TextField
                  required
                  id="distrito"
                  label="Distrito"
                  type="text"
                  fullWidth
                  value={distrito}
                  onChange={(event) => setDistrito(event.target.value)}
                />
              </Stack>
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Tamaño de la batea
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  required
                  id="row"
                  label="Filas"
                  type="number"
                  fullWidth
                  inputProps={{ min: 1 }}
                  value={row}
                  onChange={(event) => setRow(event.target.value)}
                />
                <TextField
                  required
                  id="col"
                  label="Columnas"
                  type="number"
                  fullWidth
                  inputProps={{ min: 1 }}
                  value={col}
                  onChange={(event) => setCol(event.target.value)}
                />
              </Stack>

              {totalSectores && (
                <Box sx={{ backgroundColor: 'action.hover', borderRadius: 1, padding: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Se crearán <strong>{totalSectores}</strong> sectores ({rowNum} filas × {colNum} columnas)
                  </Typography>
                </Box>
              )}
            </Stack>

          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained">Crear batea</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
