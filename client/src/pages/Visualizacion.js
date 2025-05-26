// Visualizacion.jsx
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/material';

import SelectorMenu from '../components/SelectorMenu';
import VisualizarBatea from '../components/VisualizarBatea';
import VisualizarMovimientos from '../components/VisualizarMovimientos';
import { InfoBateas } from '../components/VisualizarBatea';
import { BASE_ENDPOINT } from '../endpoint';

import { useSession } from '../context/SessionContext';



const Visualizacion = () => {
    const [selectedBatea, setSelected] = useState(null);
    const [bateas, setBateas] = useState([]);
    const [bateaData, setBateaData] = useState(null);
    const { session } = useSession();

    useEffect(() => {
        const fetchBateas = async () => {
            try {
                const response = await fetch(`${BASE_ENDPOINT}/bateas`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                const data = await response.json();
                setBateas(data);
            } catch (error) {
                console.error("Error fetching bateas:", error.message);
            }
        };

        fetchBateas();
    }, [session]);

    const handleSelectBatea = (batea) => {
        setSelected(batea);
    };

    useEffect(() => {
        const fetchBateaData = async () => {
            if (!selectedBatea) return;
            try {
                const response = await fetch(`${BASE_ENDPOINT}/sectores/${selectedBatea.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                const data = await response.json();
                setBateaData(data);
            } catch (error) {
                console.error("Error fetching batea data:", error.message);
            }
        }

        fetchBateaData();
    }, [selectedBatea, session]);

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
