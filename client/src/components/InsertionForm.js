import { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Card,
    CardContent,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Box,
    Chip,
    Stack
} from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import SelectorMenu from './SelectorMenu.js';
import { CUERDA_EMOJI } from './VisualizarBatea.js';

import axios from 'axios';
import { BASE_ENDPOINT } from '../endpoint.js';
import { useSession } from '../context/SessionContext.js';
import { getSectorId, getRowCol } from '../helper/sector.js';
import { toLocalDateString } from '../helper/date.js';
import { useResponsiveCellSize } from '../helper/useResponsiveCellSize.js';


// Rejilla de sectores de la batea destino de un intercambio: muestra cuántas
// cuerdas del tipo elegido hay ya en cada sector, y permite elegir uno solo
// (clic reemplaza la selección anterior, no es multi-selección como en el
// esquema de inserción).
const SectorDestinoGrid = ({ destinoBatea, tipoCuerda, selectedCell, onSelectCell }) => {
    const [sectores, setSectores] = useState(null);
    const { session } = useSession();
    const cols = destinoBatea.col_sector;
    const rows = destinoBatea.row_sector;
    const { containerRef, cellSize, gap } = useResponsiveCellSize(cols);

    useEffect(() => {
        let active = true;
        axios.get(`${BASE_ENDPOINT}/sectores/${destinoBatea.id}`,
            { headers: { Authorization: `Bearer ${session.access_token}` } }
        ).then((res) => { if (active) setSectores(res.data); });
        return () => { active = false; };
    }, [destinoBatea.id, session]);

    if (!sectores) return <Typography variant="body2" color="text.secondary">Cargando sectores...</Typography>;

    return (
        <div ref={containerRef} style={{ maxWidth: '100%', overflowX: 'auto' }}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                    gap: `${gap}px`,
                    marginTop: '12px',
                }}
            >
                {Array.from({ length: rows }).flatMap((_, r) =>
                    Array.from({ length: cols }).map((_, c) => {
                        const sector = sectores.find((s) => s.row === r && s.col === c);
                        const cantidad = sector?.[`cuerdas_${tipoCuerda}`] ?? 0;
                        const selected = selectedCell?.[0] === r && selectedCell?.[1] === c;

                        return (
                            <div
                                key={`${r}-${c}`}
                                onClick={() => onSelectCell([r, c])}
                                style={{
                                    padding: '8px 4px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: selected ? '#4caf50' : '#e0e0e0',
                                    color: selected ? 'white' : 'black',
                                    borderRadius: '8px',
                                    userSelect: 'none',
                                    fontWeight: 'bold',
                                }}
                            >
                                <div>{getSectorId(r, c, cols)}</div>
                                {cantidad > 0 && (
                                    <div style={{ fontSize: '0.75em', fontWeight: 'normal' }}>
                                        {CUERDA_EMOJI[tipoCuerda]} {cantidad}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};


const InsertionForm = ({ bateas, batea, selectedCells = [], onToggleCell, onClearSelection, onRefresh }) => {
    const [movementType, setMovementType] = useState('entrada');
    const [selectedCuerdaType, setSelectedCuerdaType] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [fecha, setFecha] = useState(() => toLocalDateString(new Date()));
    const [nota, setNota] = useState('');
    const [sectorNumberInput, setSectorNumberInput] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [destinoBatea, setDestinoBatea] = useState('');
    const [destinoCell, setDestinoCell] = useState(null);
    const { session } = useSession();

    // Al cambiar de batea destino, la celda seleccionada pertenecía a la anterior
    const handleSelectDestinoBatea = (b) => {
        setDestinoBatea(b);
        setDestinoCell(null);
    };

    const cols = batea.col_sector;
    const rows = batea.row_sector;

    // El intercambio es 1-a-1: sólo válido con exactamente un sector seleccionado.
    useEffect(() => {
        if (movementType === 'intercambio' && selectedCells.length !== 1) {
            setMovementType('entrada');
        }
    }, [selectedCells.length, movementType]);

    const authConfig = {
        headers: { Authorization: `Bearer ${session.access_token}` },
    };

    // Ids secuenciales de los sectores seleccionados, ordenados
    const selectedIds = selectedCells
        .map(([r, c]) => getSectorId(r, c, cols))
        .sort((a, b) => a - b);

    // Evita un intercambio sin sentido: mismo sector de origen y destino
    const esMismoSectorOrigen = destinoBatea.id === batea.id &&
        destinoCell?.[0] === selectedCells[0]?.[0] &&
        destinoCell?.[1] === selectedCells[0]?.[1];

    const handleAddByNumber = () => {
        const n = parseInt(sectorNumberInput);
        if (isNaN(n) || n < 1 || n > rows * cols) {
            alert(`Introduce un número de sector entre 1 y ${rows * cols}`);
            return;
        }
        const [row, col] = getRowCol(n, cols);
        const already = selectedCells.some(([r, c]) => r === row && c === col);
        if (!already) onToggleCell?.([row, col]);
        setSectorNumberInput('');
    };

    const resetAfterSubmit = async () => {
        // Tipo de cuerda, tipo de movimiento y fecha se mantienen: al insertar
        // varias cuerdas nuevas seguidas, normalmente son del mismo tipo y día.
        // La nota sí se limpia: suele ser específica de ese movimiento en concreto.
        setCantidad('');
        setNota('');
        setDestinoBatea('');
        setDestinoCell(null);
        setDialogOpen(false);
        if (onRefresh) await onRefresh();
        if (onClearSelection) onClearSelection();
    };

    // Entrada / salida aplicada a todos los sectores seleccionados
    const enviarMultiple = async () => {
        const cantidadParsed = parseInt(cantidad);
        setSubmitting(true);

        const results = await Promise.all(
            selectedCells.map(([row, col]) =>
                axios
                    .post(`${BASE_ENDPOINT}/movimientos`, {
                        row,
                        col,
                        batea: batea.id,
                        tipo_cuerda: selectedCuerdaType,
                        cantidad: cantidadParsed,
                        tipo_operacion: movementType,
                        fecha,
                        nota,
                    }, authConfig)
                    .then(() => ({ ok: true, row, col }))
                    .catch((error) => ({
                        ok: false,
                        row,
                        col,
                        message: error.response?.data?.error || 'Error al enviar movimiento',
                    }))
            )
        );

        setSubmitting(false);

        const failed = results.filter((r) => !r.ok);
        const okCount = results.length - failed.length;

        if (failed.length > 0) {
            const detail = failed
                .map((f) => `• Sector ${getSectorId(f.row, f.col, cols)}: ${f.message}`)
                .join('\n');
            alert(`${okCount}/${results.length} movimientos aplicados.\n\nErrores:\n${detail}`);
        }

        await resetAfterSubmit();
    };

    // Intercambio: salida en el sector de origen + entrada en el sector destino.
    // La nota de seguimiento del intercambio ("Intercambio con Batea...") la
    // necesita el servidor para arrastrar la fecha_previa entre bateas - nunca
    // se sobrescribe, la nota del usuario (si la hay) se añade detrás.
    const enviarIntercambio = async (destino) => {
        const [row, col] = selectedCells[0];
        const cantidadParsed = parseInt(cantidad);
        const conNotaUsuario = (autoNota) => (nota ? `${autoNota} · ${nota}` : autoNota);

        try {
            await axios.post(`${BASE_ENDPOINT}/movimientos`, {
                row,
                col,
                batea: batea.id,
                tipo_cuerda: selectedCuerdaType,
                cantidad: cantidadParsed,
                tipo_operacion: 'salida',
                nota: conNotaUsuario(`Intercambio con Batea ${destino.bateaName} (${destino.bateaId}) en (${destino.row + 1}, ${destino.col + 1})`),
                fecha,
            }, authConfig);

            await axios.post(`${BASE_ENDPOINT}/movimientos`, {
                row: destino.row,
                col: destino.col,
                batea: destino.bateaId,
                tipo_cuerda: selectedCuerdaType,
                cantidad: cantidadParsed,
                tipo_operacion: 'entrada',
                nota: conNotaUsuario(`Intercambio con Batea ${batea.name} (${batea.id}) en (${row + 1}, ${col + 1})`),
                fecha,
            }, authConfig);

            await resetAfterSubmit();
        } catch (error) {
            const message = error.response?.data?.error || 'Error al enviar el intercambio';
            alert(`Error: ${message}`);
        }
    };

    const handleSubmit = () => {
        if (selectedCells.length === 0 || !selectedCuerdaType || !cantidad) return;

        if (movementType === 'intercambio') {
            setDialogOpen(true);
        } else {
            enviarMultiple();
        }
    };

    return (
        <Card sx={{ width: { xs: '100%', sm: 400 }, maxWidth: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Movimiento de Cuerdas
                </Typography>

                <Typography variant="subtitle1">
                    Batea: {batea.name}
                </Typography>

                {/* Añadir sector por número */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
                    <TextField
                        label="Añadir sector nº"
                        type="number"
                        size="small"
                        value={sectorNumberInput}
                        onChange={(e) => setSectorNumberInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddByNumber(); }}
                        inputProps={{ min: 1, max: rows * cols }}
                        sx={{ flex: 1 }}
                    />
                    <Button variant="outlined" onClick={handleAddByNumber}>Añadir</Button>
                </Box>

                {/* Resumen de sectores seleccionados */}
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                            Sectores seleccionados ({selectedIds.length})
                        </Typography>
                        {selectedIds.length > 0 && (
                            <Button size="small" color="secondary" onClick={onClearSelection}>
                                Limpiar
                            </Button>
                        )}
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {selectedIds.length === 0 ? (
                            <Typography variant="caption" color="text.secondary">
                                Haz clic en el esquema o añade un sector por número.
                            </Typography>
                        ) : (
                            selectedIds.map((id) => <Chip key={id} label={id} size="small" />)
                        )}
                    </Stack>
                </Box>

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
                    sx={{ my: 1, flexWrap: 'wrap' }}
                >
                    <ToggleButton value="entrada">Entrada</ToggleButton>
                    <ToggleButton value="salida">Salida</ToggleButton>
                    <ToggleButton value="intercambio" disabled={selectedCells.length !== 1}>
                        Intercambio
                    </ToggleButton>
                </ToggleButtonGroup>
                {selectedCells.length !== 1 && (
                    <Typography variant="caption" color="text.secondary" display="block">
                        El intercambio requiere exactamente un sector seleccionado.
                    </Typography>
                )}

                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Tipo de Cuerda</InputLabel>
                    <Select
                        value={selectedCuerdaType}
                        label="Tipo de Cuerda"
                        onChange={(e) => setSelectedCuerdaType(e.target.value)}
                    >
                        <MenuItem value="pesca">Pesca</MenuItem>
                        <MenuItem value="cria">Cría</MenuItem>
                        <MenuItem value="desdoble">Desdoble</MenuItem>
                        <MenuItem value="reparque">Reparque</MenuItem>
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

                <TextField
                    label="Fecha del movimiento"
                    type="date"
                    fullWidth
                    sx={{ mt: 2 }}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                    label="Nota (opcional)"
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ mt: 2 }}
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    helperText={movementType === 'intercambio'
                        ? 'Se añadirá junto al registro automático del intercambio.'
                        : undefined}
                />

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={handleSubmit}
                    disabled={selectedCells.length === 0 || !selectedCuerdaType || !cantidad || submitting}
                >
                    {movementType === 'intercambio'
                        ? 'Enviar Intercambio'
                        : `Enviar a ${selectedCells.length} sector${selectedCells.length === 1 ? '' : 'es'}`}
                </Button>
            </CardContent>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
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
                        <SelectorMenu bateas={bateas} onSelectBatea={handleSelectDestinoBatea} />
                    </FormControl>

                    {destinoBatea.id && (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                Elige el sector destino en {destinoBatea.name} ({CUERDA_EMOJI[selectedCuerdaType]} cuerdas de {selectedCuerdaType} ya presentes)
                            </Typography>
                            <SectorDestinoGrid
                                destinoBatea={destinoBatea}
                                tipoCuerda={selectedCuerdaType}
                                selectedCell={destinoCell}
                                onSelectCell={setDestinoCell}
                            />
                            {esMismoSectorOrigen && (
                                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                                    Es el mismo sector de origen: elige un sector distinto.
                                </Typography>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="secondary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={() =>
                            enviarIntercambio({
                                bateaId: destinoBatea.id,
                                bateaName: destinoBatea.name,
                                row: destinoCell[0],
                                col: destinoCell[1],
                            })
                        }
                        color="primary"
                        variant="contained"
                        disabled={!destinoBatea.id || !destinoCell || esMismoSectorOrigen}
                    >
                        Confirmar Intercambio
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default InsertionForm;
