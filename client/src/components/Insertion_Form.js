import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import axios from 'axios';


const Insertion_Form = ({ batea, selectedCell, sectores, onManualCellSelect, onSectorUpdate }) => {
    const [movementType, setMovementType] = useState('entrada');
    const [criaChange, setCriaChange] = useState('');
    const [cultivoChange, setCultivoChange] = useState('');
    const [rowInput, setRowInput] = useState('');
    const [colInput, setColInput] = useState('');
    const [criaCurrent, setCriaCurrent] = useState(0);
    const [cultivoCurrent, setCultivoCurrent] = useState(0);

    // Sincronizar los inputs con la selección de celda actual
    useEffect(() => {
        if (selectedCell) {
            setRowInput(selectedCell[0] + 1); // Convertimos de índice a número
            setColInput(selectedCell[1] + 1); // Convertimos de índice a número
            updateCuerdaValues(selectedCell);
        } else {
            setRowInput('');
            setColInput('');
            setCriaCurrent(0);
            setCultivoCurrent(0);
        }
    }, [selectedCell]);

    // Buscar la información del sector seleccionado en sectores
    const updateCuerdaValues = (cell) => {
        if (cell) {
            const sector = sectores.find(
                (sector) => sector.x === cell[0] && sector.y === cell[1]
            );
            if (sector) {
                setCriaCurrent(sector.cuerdas_cria);
                setCultivoCurrent(sector.cuerdas_cultivo);
            }
        }
    };

    const handleRowChange = (e) => {
        setRowInput(e.target.value);
        updateSelectedCell(e.target.value, colInput);
    };

    const handleColChange = (e) => {
        setColInput(e.target.value);
        updateSelectedCell(rowInput, e.target.value);
    };

    const updateSelectedCell = (row, col) => {
        if (row && col) {
            const rowNum = parseInt(row) - 1; // Convertimos de número a índice
            const colNum = parseInt(col) - 1; // Convertimos de número a índice
            if (!isNaN(rowNum) && !isNaN(colNum)) {
                onManualCellSelect([rowNum, colNum]);
            }
        }
    };

    const handleSubmit = async () => {
        console.log("Enviado movimiento con los siguientes datos:");
        if (!selectedCell) return;

    const [x, y] = selectedCell;
    const bateaId = batea.id;

    try {
        let newCria = criaCurrent;
        let newCultivo = cultivoCurrent;

        // Movimiento de cría (si se ha introducido un valor)
        if (criaChange !== '' && criaChange !== '0') {
            const cantidad = parseInt(criaChange);
            const responseCria = await axios.post('http://localhost:5010/movimientos', {
                x,
                y,
                batea: bateaId,
                tipo_cuerda: 'cria',
                cantidad,
                tipo_operacion: movementType
            });
            console.log('Movimiento de cría enviado:', responseCria.data);

            //Actualizo el valor local
            newCria = movementType === 'entrada' ? criaCurrent + cantidad : criaCurrent - cantidad;
            setCriaCurrent(newCria);
        }

        // Movimiento de cultivo (si se ha introducido un valor)
        if (cultivoChange !== '' && cultivoChange !== '0') {
            const cantidad = parseInt(cultivoChange);
            const responseCultivo = await axios.post('http://localhost:5010/movimientos', {
                x,
                y,
                batea: bateaId,
                tipo_cuerda: 'cultivo',
                cantidad,
                tipo_operacion: movementType
            });
            console.log('Movimiento de cultivo enviado:', responseCultivo.data);

            //Actualizo el valor local
            newCultivo = movementType === 'entrada' ? cultivoCurrent + cantidad : cultivoCurrent - cantidad;
            setCultivoCurrent(newCultivo);
        }

        if (onSectorUpdate) {
            onSectorUpdate(x, y, {
              cuerdas_cria: newCria,
              cuerdas_cultivo: newCultivo
            });
          }

        setCriaChange('');
        setCultivoChange('');

        // Puedes mostrar un mensaje de éxito aquí
    } catch (error) {
        console.error('Error al enviar el movimiento:', error);
        // También puedes mostrar un mensaje de error en pantalla si quieres
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
                        <TextField //TODO: Limitar a 0 y al número máximo de filas
                            label="Fila"
                            fullWidth
                            value={rowInput}
                            onChange={handleRowChange}
                            type="number"
                            placeholder="Fila"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField //TODO: Limitar a 0 y al número máximo de columnas
                            label="Columna"
                            fullWidth
                            value={colInput}
                            onChange={handleColChange}
                            type="number"
                            placeholder="Columna"
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

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle2">Cuerda de Cría</Typography>
                                <Typography variant="body2">Actualmente: {criaCurrent}</Typography>
                                <TextField
                                    label="Cambio"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    margin="dense"
                                    value={criaChange}
                                    onChange={(e) => setCriaChange(e.target.value)}
                                    inputProps={{ min: 0 }} //TODO: Quitar el deprecated
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle2">Cuerda de Cultivo</Typography>
                                <Typography variant="body2">Actualmente: {cultivoCurrent}</Typography>
                                <TextField
                                    label="Cambio"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    margin="dense"
                                    value={cultivoChange}
                                    onChange={(e) => setCultivoChange(e.target.value)}
                                    inputProps={{ min: 0 }} //TODO: Quitar el deprecated
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={handleSubmit}
                    disabled={!selectedCell}
                >
                    Enviar Movimiento
                </Button>
            </CardContent>
        </Card>
    );
};

export default Insertion_Form;
