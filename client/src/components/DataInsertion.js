import React, {useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material'; // Asegúrate de importar Box
import axios from 'axios';
import Grid from '@mui/material/Grid2';


import SelectorMenu from './SelectorMenu.js';
import NuevaBatea from './NuevaBatea.js';
import EsquemaBatea from './EsquemaBatea.js';
import { InfoBateas } from './VisualizarBatea.js';
import InsertionForm from './InsertionForm.js';
import { BASE_ENDPOINT } from '../endpoint.js';

import { useSession } from '../context/SessionContext';






const DataInsertion = () => {
    const [selectedBatea, setSelected] = React.useState(null);
    const [selectedCells, setSelectedCells] = React.useState([]);
    const [bateaData, setBateaData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [bateas, setBateas] = useState([]);

    const { session } = useSession();

    useEffect(() => {
        const fetchBateas = async () => {
            try {
                const response = await axios.get(`${BASE_ENDPOINT}/bateas`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        }
                    }
                );
                setBateas(response.data);
            } catch (error) {
                console.error("Error fetching bateas:", error.message);
            }
        };

        fetchBateas();
    }, [session]);



    const handleSelectBatea = (batea) => {
        setSelected(batea);
        setSelectedCells([]); // limpiar selección al cambiar de batea
    };

    // Añade o quita un sector de la selección múltiple
    const handleToggleCell = (cell) => {
        if (!cell) return;
        const [row, col] = cell;
        setSelectedCells((prev) => {
            const exists = prev.some(([r, c]) => r === row && c === col);
            return exists
                ? prev.filter(([r, c]) => !(r === row && c === col))
                : [...prev, [row, col]];
        });
    };

    const handleClearSelection = () => setSelectedCells([]);


    // No cambia `loading`: se usa también para refrescar en segundo plano tras
    // enviar un movimiento, y no queremos desmontar EsquemaBatea/InsertionForm
    // (eso reiniciaría el estado del formulario, ej. tipo de cuerda y fecha).
    const fetchBateaData = useCallback(async () => {
        if (!selectedBatea) return;
        try {
            const response = await axios.get(`${BASE_ENDPOINT}/sectores/${selectedBatea.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    }
                }
            );
            setBateaData(response.data);
        } catch (error) {
            console.error("Error fetching batea data:", error.message);
        }
    }, [selectedBatea, session]);

    useEffect(() => {
        if (!selectedBatea) return;
        setLoading(true);
        fetchBateaData().finally(() => setLoading(false));
    }, [selectedBatea]); // eslint-disable-line react-hooks/exhaustive-deps
    

    if (loading) {
        return <div>Cargando...</div>;
    }


    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: '80px',
                }}
            >
                <SelectorMenu onSelectBatea={handleSelectBatea} bateas={bateas}/>
                <NuevaBatea />
            </Box>

            {selectedBatea && (
                <>
                    <InfoBateas batea={selectedBatea} />

                    {/* Contenedor del bloque centrado */}
                    <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '40px',
                        paddingX: 4,
                        overflowX: 'auto', // Opcional: permite hacer scroll horizontal si se sale de la pantalla
                    }}
                    >
                    <Grid
                        container
                        spacing={4}
                        sx={{
                        width: 'fit-content', // 👈 se adapta al contenido en vez de limitarse a 100%
                        maxWidth: '100%',     // 👈 permite expandirse todo lo que quiera, sin romper el layout
                        justifyContent: 'center',
                        }}
                    >
                        <Grid item>
                        <Box
                            sx={{
                            padding: 2,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            boxShadow: 1,
                            }}
                        >
                            <EsquemaBatea
                            batea={selectedBatea}
                            selectedCells={selectedCells}
                            onToggleCell={handleToggleCell}
                            />
                        </Box>
                        </Grid>
                        <Grid item>
                        <Box
                            sx={{
                            padding: 2,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            boxShadow: 1,
                            }}
                        >
                            <InsertionForm
                            batea={selectedBatea}
                            selectedCells={selectedCells}
                            sectores={bateaData}
                            onToggleCell={handleToggleCell}
                            onClearSelection={handleClearSelection}
                            onRefresh={fetchBateaData}
                            bateas={bateas}
                            />
                        </Box>
                        </Grid>
                    </Grid>
                    </Box>
                </>
            )}
        </>
    );
}

export default DataInsertion;