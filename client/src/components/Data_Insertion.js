import React, {Fragment, useState, useEffect } from 'react';
import { Box } from '@mui/material'; // Asegúrate de importar Box
import axios from 'axios';
import Grid from '@mui/material/Grid2';


import Selector_Menu from './Selector_Menu.js';
import Nueva_Batea from './Nueva_Batea.js';
import Visualizar_Batea from './Visualizar_Batea.js';
import Esquema_Batea from './Esquema_Batea.js';
import { Info_Bateas } from './Visualizar_Batea';
import Insertion_Form from './Insertion_Form.js';





const Data_Insertion = () => {
    const [selectedBatea, setSelected] = React.useState(null);
    const [selectedCell, setSelectedCell] = React.useState(null);
    const [bateaData, setBateaData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [bateas, setBateas] = useState([]);

    useEffect(() => {
        const fetchBateas = async () => {
            try {
                const response = await axios.get('http://localhost:5010/bateas');
                setBateas(response.data);
            } catch (error) {
                console.error("Error fetching bateas:", error.message);
            }
        };

        fetchBateas();
    }, []);



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
                const response = await axios.get(`http://localhost:5010/sectores/${selectedBatea.id}`);
                setBateaData(response.data);
            } catch (error) {
                console.error("Error fetching batea data:", error.message);
            }
            setLoading(false);
        };

        fetchBateaData();
    }, [selectedBatea]); // Solo se ejecuta cuando seleccionamos una batea

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
                <Selector_Menu onSelectBatea={handleSelectBatea} bateas={bateas}/>
                <Nueva_Batea />
            </Box>

            {selectedBatea && (
                <>
                    <Info_Bateas batea={selectedBatea} />

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
                            <Esquema_Batea
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
                            <Insertion_Form
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

export default Data_Insertion;