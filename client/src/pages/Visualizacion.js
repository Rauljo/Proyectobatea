// Visualizacion.jsx
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/material';

import SelectorMenu from '../components/SelectorMenu';
import VisualizarBatea from '../components/VisualizarBatea';
import VisualizarMovimientos from '../components/VisualizarMovimientos';
import { InfoBateas } from '../components/VisualizarBatea';
import { BASE_ENDPOINT } from '../endpoint';



const Visualizacion = () => {
    const [selectedBatea, setSelected] = useState(null);
    const [bateas, setBateas] = useState([]);
    const [bateaData, setBateaData] = useState(null);

    useEffect(() => {
        const fetchBateas = async () => {
            try {
                const response = await fetch(`${BASE_ENDPOINT}/bateas`);
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
                const response = await fetch(`${BASE_ENDPOINT}/sectores/${selectedBatea.id}`);
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
                <SelectorMenu onSelectBatea={handleSelectBatea} bateas={bateas} />
            </Box>

            {bateaData && (
                <Box>
                    <InfoBateas batea={selectedBatea} sectores={bateaData} />
                    <Grid
                        container
                        spacing={4}
                        sx={{
                            justifyContent: 'center',
                        }}
                        >
                        <Grid item>
                            <VisualizarBatea batea={selectedBatea} bateaData={bateaData} />
                        </Grid>
                        <Grid item>
                            <VisualizarMovimientos batea={selectedBatea} />
                        </Grid>
                        </Grid>
                </Box>
            )}
        </div>
    );
};

export default Visualizacion;
