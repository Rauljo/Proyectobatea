import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { BASE_ENDPOINT } from '../endpoint';
import { useSession } from '../context/SessionContext';




import axios from "axios";

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);

  const[name, setName] = React.useState("");
  const[polygon, setPolygon] = React.useState("");
  const[row, setRow] = React.useState("");
  const[col, setCol] = React.useState("");
  const { session } = useSession();



  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = { name, polygon, row, col };

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

  // Generar las filas y columnas de la tabla
  const generateTable = () => {
    let rows = [];
    for (let i = 0; i < row; i++) {
      let cols = [];
      for (let j = 0; j < col; j++) {
        cols.push(
          <TableCell key={j} sx={{ border: '1px solid black', textAlign: 'center' }}>
            {i + 1} - {j + 1}
          </TableCell>
        );
      }
      rows.push(<TableRow key={i}>{cols}</TableRow>);
    }
    return rows;
  };

    
  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Añadir Batea
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: handleSubmit,
          },
        }}
      >
        <DialogTitle>Crear Nueva Batea</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Para crear una nueva batea introduce su nombre y polígono
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="Name"
            label="Nombre"
            type="text"
            fullWidth
            variant="standard"
            value = {name}
            onChange = {(event) => {
                setName(event.target.value);
            }}
          />
            <TextField
                required
                margin="dense"
                id="polygon"
                name="Polygon"
                label="Polígono"
                type="text"
                fullWidth
                variant="standard"
                value = {polygon}
                onChange = {(event) => {
                    setPolygon(event.target.value);
                }}
            />
            <Stack direction="row" spacing={2}>
                <TextField
                  required
                  margin="dense"
                  id="row"
                  name="Row"
                  label="Row"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={row}
                  onChange={(event) => setRow(event.target.value)}
                />
                <TextField
                  required
                  margin="dense"
                  id="col"
                  name="Col"
                  label="Col"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={col}
                  onChange={(event) => setCol(event.target.value)}
                />
              </Stack>

            {/* Show batea grid */}
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                <Table>
                <TableHead>
                    <TableRow sx={{ borderTop: '1px solid black' }}>
                    </TableRow>
                </TableHead>
                <TableBody>{generateTable()}</TableBody>
                </Table>
            </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Añadir</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
