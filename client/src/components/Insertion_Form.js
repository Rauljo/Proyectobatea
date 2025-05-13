import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Card,
    CardContent,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Autocomplete
} from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import axios from 'axios';

import Esquema_Batea from './Esquema_Batea';

const Insertion_Form = ({ bateas, batea, selectedCell, sectores, onManualCellSelect, onSectorUpdate }) => {
    const [movementType, setMovementType] = useState('entrada');
    const [selectedCuerdaType, setSelectedCuerdaType] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [rowInput, setRowInput] = useState('');
    const [colInput, setColInput] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [destinoBateaId, setDestinoBateaId] = useState('');
    const [destinoRow, setDestinoRow] = useState('');
    const [destinoCol, setDestinoCol] = useState('');
    const [bateaDestino, setBateaDestino] = useState(null);



    // Sincronizar inputs con la celda seleccionada
    useEffect(() => {
        if (selectedCell) {
            setRowInput(selectedCell[0] + 1);
            setColInput(selectedCell[1] + 1);
        } else {
            setRowInput('');
            setColInput('');
        }
    }, [selectedCell]);

    const handleRowChange = (e) => {
        setRowInput(e.target.value);
        updateSelectedCell(e.target.value, colInput);
    };

    const handleColChange = (e) => {
        setColInput(e.target.value);
        updateSelectedCell(rowInput, e.target.value);
    };

    const updateSelectedCell = (row, col) => {
        const rowNum = parseInt(row) - 1;
        const colNum = parseInt(col) - 1;
        if (!isNaN(rowNum) && !isNaN(colNum)) {
            onManualCellSelect([rowNum, colNum]);
        }
    };

    const enviarMovimiento = async (destino = null) => {
        const [x, y] = selectedCell;
        const bateaId = batea.id;
        const cantidadParsed = parseInt(cantidad);

        try {


            const payload = {
                x,
                y,
                batea: bateaId,
                tipo_cuerda: selectedCuerdaType,
                cantidad: cantidadParsed,
                tipo_operacion: movementType,
            };

            if (movementType === 'intercambio' && destino) {
                payload.tipo_operacion = 'salida';
                payload.nota = `Intercambio con Batea ${destino.bateaId} en (${destino.x + 1}, ${destino.y + 1})`;
            };
            console.log('Payload:', payload);
            // Enviar movimiento base
            const response = await axios.post('http://localhost:5010/movimientos', payload);
            console.log('Movimiento enviado:', response.data);

            //Ahora, si hay un intercambio, enviamos el movimiento de entrada
            if (movementType === 'intercambio' && destino) {
                payload.x = destino.x;
                payload.y = destino.y;
                payload.batea = destino.bateaId;
                payload.tipo_operacion = 'entrada';
                payload.nota = `Intercambio con Batea ${bateaId} en (${x + 1}, ${y + 1})`;

                const response = await axios.post('http://localhost:5010/movimientos', payload);
                console.log('Movimiento de entrada enviado:', response.data);

            };

            if (onSectorUpdate) onSectorUpdate(x, y);

            // Limpiar estados
            setCantidad('');
            setSelectedCuerdaType('');
            setDestinoBateaId('');
            setDestinoRow('');
            setDestinoCol('');
            setDialogOpen(false);

        } catch (error) {
            console.error('Error al enviar el movimiento:', error);
        }
    };

    const handleSubmit = async () => {
        if (!selectedCell || !selectedCuerdaType || !cantidad) return;

        if (movementType === 'intercambio') {
            setDialogOpen(true);  // abrir diálogo
            console.log('Intercambio seleccionado');
        } else {
            enviarMovimiento();  // entrada o salida normales
        }
    };

    return (
        <Card sx={{ width: 400 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Movimiento de Cuerdas
                </Typography>

                <Typography variant="subtitle1">
                    Batea: {batea.name}
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            label="Fila"
                            fullWidth
                            value={rowInput}
                            onChange={handleRowChange}
                            type="number"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Columna"
                            fullWidth
                            value={colInput}
                            onChange={handleColChange}
                            type="number"
                        />
                    </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Tipo de Movimiento
                </Typography>
                <ToggleButtonGroup
                    color="primary"
                    value={movementType}
                    exclusive
                    onChange={(e, newValue) => {
                        if (newValue !== null) setMovementType(newValue);
                    }}
                    sx={{ my: 1 }}
                >
                    <ToggleButton value="entrada">Entrada</ToggleButton>
                    <ToggleButton value="salida">Salida</ToggleButton>
                    <ToggleButton value="intercambio">Intercambio</ToggleButton>
                </ToggleButtonGroup>

                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Tipo de Cuerda</InputLabel>
                    <Select
                        value={selectedCuerdaType}
                        label="Tipo de Cuerda"
                        onChange={(e) => setSelectedCuerdaType(e.target.value)}
                    >
                        <MenuItem value="pesca">Pesca</MenuItem>
                        <MenuItem value="piedra">Piedra</MenuItem>
                        <MenuItem value="desdoble">Desdoble</MenuItem>
                        <MenuItem value="comercial">Comercial</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="Cantidad"
                    type="number"
                    fullWidth
                    sx={{ mt: 2 }}
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    inputProps={{ min: 0 }}
                />

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={handleSubmit}
                    disabled={!selectedCell || !selectedCuerdaType || !cantidad}
                >
                    Enviar Movimiento
                </Button>
            </CardContent>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth='md'>
                <DialogTitle>
                    Indicar destino del intercambio
                    <IconButton
                        aria-label="close"
                        onClick={() => setDialogOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <Autocomplete
                            options={bateas}
                            getOptionLabel={(option) => option.name}
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    setDestinoBateaId(newValue.id);
                                    setBateaDestino(newValue); // guardamos la batea completa
                                } else {
                                    setDestinoBateaId('');
                                    setBateaDestino(null);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Batea destino"
                                    sx={{ mt: 2 }}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    </FormControl>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                label="Fila Destino"
                                type="number"
                                fullWidth
                                value={destinoRow}
                                onChange={(e) => setDestinoRow((e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Columna Destino"
                                type="number"
                                fullWidth
                                value={destinoCol}
                                onChange={(e) => setDestinoCol((e.target.value))}
                            />
                        </Grid>
                        <Grid
                            container
                            justifyContent="center"   // Centra horizontalmente
                            alignItems="center"        // Centra verticalmente
                            sx={{ mt: 1 }}
                        >
                            <Grid item>
                                {bateaDestino && (
                                    <Esquema_Batea
                                        batea={bateaDestino}
                                        selectedCell={[destinoRow, destinoCol]}
                                        onCellSelect={(newCell) => {
                                            if (newCell) {
                                                setDestinoRow(newCell[0]);
                                                setDestinoCol(newCell[1]);
                                            } else {
                                                setDestinoRow('');
                                                setDestinoCol('');
                                            }
                                        }}
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="secondary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={() =>
                            console.log(destinoBateaId, parseInt(destinoCol)-1, parseInt(destinoRow)-1) ||
                            enviarMovimiento({
                                bateaId: destinoBateaId,
                                x: parseInt(destinoCol) - 1,
                                y: parseInt(destinoRow) - 1
                            })
                        }
                        color="primary"
                        variant="contained"
                        disabled={!destinoBateaId || !destinoRow || !destinoCol}
                    >
                        Confirmar Intercambio
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default Insertion_Form;
