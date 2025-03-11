import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import axios from "axios";

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);

  const[name, setName] = React.useState("");
  const[polygon, setPolygon] = React.useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = { name, polygon };

    try {
        const response = await axios.post("http://localhost:5010/bateas", data);

        if (response.status == 200 || response.status == 201) {
            console.log("Batea añadida correctamente");
            window.location.reload();
        }
    } catch (error) {
        console.error(error.message);
    }
    
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Añadir</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
