import React from 'react';
import { useState } from 'react';
import Grid from '@mui/material/Grid2';


import Selector_Menu from '../components/Selector_Menu';
import Visualizar_Batea from '../components/Visualizar_Batea';
import Visualizar_Movimientos from '../components/Visualizar_Movimientos';


const Visualizacion = () => {
    const [selectedBatea, setSelected] = React.useState(null);
    
        const handleSelectBatea = (batea) => {
            setSelected(batea);
        };

    return (
        <div>
            <h1>Visualización</h1>
            <Selector_Menu onSelectBatea={handleSelectBatea}/>
            {selectedBatea && (
                <div>
                    <Grid container spacing={2}>
                        <Grid item size="auto" sx={{ display: "flex", justifyContent: "center" }}>
                            <Visualizar_Batea batea={selectedBatea} onlyvisual="1" />
                        </Grid>
                        <Grid item size="auto" sx={{ display: "flex", justifyContent: "center" }}>
                            <Visualizar_Movimientos batea={selectedBatea} />
                        </Grid>
                    </Grid>
                </div>)}
        </div>
    );
}

export default Visualizacion;