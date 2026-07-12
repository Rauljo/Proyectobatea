// Visualizacion.jsx
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/material';
import axios from 'axios';

import SelectorMenu from '../components/SelectorMenu';
import VisualizarBatea from '../components/VisualizarBatea';
import VisualizarMovimientos from '../components/VisualizarMovimientos';
import { InfoBateas } from '../components/VisualizarBatea';
import { BASE_ENDPOINT } from '../endpoint';

import { useSession } from '../context/SessionContext';
import { useSelectedBatea } from '../context/SelectedBateaContext';



const Visualizacion = () => {
    const { selectedBatea, setSelectedBatea: setSelected } = useSelectedBatea();
    const [bateas, setBateas] = useState([]);
    const [bateaData, setBateaData] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [umbrales, setUmbrales] = useState([]);
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

    // Umbrales de vigencia, para colorear los sectores según su estado
    useEffect(() => {
        const fetchUmbrales = async () => {
            try {
                const response = await axios.get(`${BASE_ENDPOINT}/umbrales`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                setUmbrales(response.data);
            } catch (error) {
                console.error("Error fetching umbrales:", error.message);
            }
        };

        fetchUmbrales();
    }, [session]);

    const handleSelectBatea = (batea) => {
        setSelected(batea);
    };

    useEffect(() => {
        const fetchBateaData = async () => {
            if (!selectedBatea) return;
            try {
                // Sectores y movimientos en paralelo: los movimientos se usan
                // tanto en la lista como para colorear la rejilla por vigencia
                const [sectoresRes, movimientosRes] = await Promise.all([
                    axios.get(`${BASE_ENDPOINT}/sectores/${selectedBatea.id}`,
                        { headers: { Authorization: `Bearer ${session.access_token}` } }),
                    axios.get(`${BASE_ENDPOINT}/movimientos/${selectedBatea.id}?vigencia=true`,
                        { headers: { Authorization: `Bearer ${session.access_token}` } }),
                ]);
                setBateaData(sectoresRes.data);
                setMovimientos(movimientosRes.data);
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
                    marginTop: { xs: '24px', md: '80px' },
                    paddingX: 2,
                }}
            >
                <SelectorMenu onSelectBatea={handleSelectBatea} bateas={bateas} />
            </Box>

            {bateaData && (
                <Box sx={{ paddingX: { xs: 2, md: 4 } }}>
                    <InfoBateas batea={selectedBatea} sectores={bateaData} />
                    <Grid
                        container
                        spacing={4}
                        sx={{
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: 'center',
                        }}
                        >
                        <Grid item sx={{ width: { xs: '100%', md: 'auto' }, maxWidth: '100%' }}>
                            <VisualizarBatea
                                batea={selectedBatea}
                                bateaData={bateaData}
                                movimientos={movimientos}
                                umbrales={umbrales}
                            />
                        </Grid>
                        <Grid item sx={{ width: { xs: '100%', md: 'auto' }, maxWidth: '100%' }}>
                            <VisualizarMovimientos batea={selectedBatea} movimientos={movimientos} />
                        </Grid>
                        </Grid>
                </Box>
            )}
        </div>
    );
};

export default Visualizacion;
