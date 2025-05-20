import React from 'react';
import { useState } from 'react';
import Grid from '@mui/material/Grid2';
import { Box } from '@mui/material'; // Asegúrate de importar Box



import Selector_Menu from '../components/Selector_Menu';
import Visualizar_Batea from '../components/Visualizar_Batea';
import Visualizar_Movimientos from '../components/Visualizar_Movimientos';


const Visualizacion = () => {
    const [selectedBatea, setSelected] = React.useState(null);

    const [bateas, setBateas] = useState([]);

    React.useEffect(() => {
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

    return (
        <div>
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
            </Box>
            {selectedBatea && (
                <Box
                    sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: 4,
                    }}
                >
                    <Grid
                    container
                    spacing={10}
                    sx={{
                        justifyContent: 'center', // centra los Grid items dentro del container
                        //maxWidth: '1200px',        // opcional: limita el ancho
                    }}
                    >
                    <Grid item>
                        <Visualizar_Batea batea={selectedBatea} onlyvisual="1" />
                    </Grid>
                    <Grid item>
                        <Visualizar_Movimientos batea={selectedBatea} />
                    </Grid>
                    </Grid>
                </Box>
                )}
        </div>
    );
}

export default Visualizacion;