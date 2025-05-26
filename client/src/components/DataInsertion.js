import React, {useState, useEffect } from 'react';
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
    const [selectedCell, setSelectedCell] = React.useState(null);
    const [bateaData, setBateaData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [bateas, setBateas] = useState([]);

    const { session } = useSession();

    useEffect(() => {
        const fetchBateas = async () => {
            try {
                console.log("Tried selecting bateas: ", session);
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
    };

    // Función para actualizar la celda seleccionada
    const handleManualCellSelect = (cell) => {
        setSelectedCell(cell); // Actualiza la celda seleccionada con las coordenadas x e y
    };

    const handleSectorUpdate = (row, col, updatedSector) => {
        setBateaData((prev) =>
          prev.map((s) =>
            s.row === row && s.col === col ? { ...s, ...updatedSector } : s
          )
        );
      };
      

    useEffect(() => {
        if (!selectedBatea) return;

        const fetchBateaData = async () => {
            setLoading(true);
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
            setLoading(false);
        };

        fetchBateaData();
    }, [selectedBatea, session]); // Solo se ejecuta cuando seleccionamos una batea
    

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
                            selectedCell={selectedCell}
                            onCellSelect={handleManualCellSelect}
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
                            selectedCell={selectedCell}
                            sectores={bateaData}
                            onManualCellSelect={handleManualCellSelect}
                            onSectorUpdate={handleSectorUpdate}
                            bateas = {bateas}
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