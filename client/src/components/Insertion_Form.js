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
    InputLabel
} from '@mui/material';
import axios from 'axios';

const Insertion_Form = ({ batea, selectedCell, sectores, onManualCellSelect, onSectorUpdate }) => {
    const [movementType, setMovementType] = useState('entrada');
    const [selectedCuerdaType, setSelectedCuerdaType] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [rowInput, setRowInput] = useState('');
    const [colInput, setColInput] = useState('');

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

    const handleSubmit = async () => {
        if (!selectedCell || !selectedCuerdaType || !cantidad) return;

        const [x, y] = selectedCell;
        const bateaId = batea.id;

        try {
            const cantidadParsed = parseInt(cantidad);
            const response = await axios.post('http://localhost:5010/movimientos', {
                x,
                y,
                batea: bateaId,
                tipo_cuerda: selectedCuerdaType,
                cantidad: cantidadParsed,
                tipo_operacion: movementType
            });

            console.log('Movimiento enviado:', response.data);

            // Llamar callback si se proporciona
            if (onSectorUpdate) {
                // Esta parte dependerá de cómo quieras actualizarlo. Aquí no se actualiza el valor local directamente.
                onSectorUpdate(x, y); 
            }

            // Limpiar campos
            setCantidad('');
            setSelectedCuerdaType('');

        } catch (error) {
            console.error('Error al enviar el movimiento:', error);
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
        </Card>
    );
};

export default Insertion_Form;
