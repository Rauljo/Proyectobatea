// Visualizacion.jsx
import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/material';

import Selector_Menu from '../components/Selector_Menu';
import Visualizar_Batea from '../components/Visualizar_Batea';
import Visualizar_Movimientos from '../components/Visualizar_Movimientos';
import { Info_Bateas } from '../components/Visualizar_Batea';


const Visualizacion = () => {
    const [selectedBatea, setSelected] = useState(null);
    const [bateas, setBateas] = useState([]);
    const [bateaData, setBateaData] = useState(null);

    useEffect(() => {
        const fetchBateas = async () => {
            try {
                const response = await fetch('http://localhost:5010/bateas');
                const data = await response.json();
                setBateas(data);
            } catch (error) {
                console.error("Error fetching bateas:", error.message);
            }
        };

        fetchBateas();
    }, []);

    const handleSelectBatea = (batea) => {
        setSelected(batea);
    };

    useEffect(() => {
        const fetchBateaData = async () => {
            if (!selectedBatea) return;
            try {
                const response = await fetch(`http://localhost:5010/sectores/${selectedBatea.id}`);
                const data = await response.json();
                setBateaData(data);
            } catch (error) {
                console.error("Error fetching batea data:", error.message);
            }
        }

        fetchBateaData();
    }, [selectedBatea]);

    return (
        <div>
            {/* Menú de selección */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: '80px',
                }}
            >
                <Selector_Menu onSelectBatea={handleSelectBatea} bateas={bateas} />
            </Box>

            {bateaData && (
                <Box>
                    <Info_Bateas batea={selectedBatea} sectores={bateaData} />
                    <Grid
                        container
                        spacing={4}
                        sx={{
                            justifyContent: 'center',
                        }}
                        >
                        <Grid item>
                            <Visualizar_Batea batea={selectedBatea} bateaData={bateaData} />
                        </Grid>
                        <Grid item>
                            <Visualizar_Movimientos batea={selectedBatea} />
                        </Grid>
                        </Grid>
                </Box>
            )}
        </div>
    );
};

export default Visualizacion;
