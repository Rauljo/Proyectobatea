import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material';

const Navigation = () => {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <AppBar position="static">
            <Toolbar sx={{ display: 'flex', justifyContent: 'flex-start', gap: 50 }}>
                {/* "Bateas" alineado a la izquierda */}
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Bateas
                </Typography>

                {/* Espacio entre "Bateas" y las opciones de menú */}
                <Box sx={{ width: '50px' }} />

                {/* Opciones de menú alineadas a la izquierda y en negrita */}
                <Tabs value={value} onChange={handleChange} textColor="inherit">
                    <Tab label="Inserción" sx={{ fontWeight: 'bold' }} />
                    <Tab label="Visualización" sx={{ fontWeight: 'bold' }} />
                </Tabs>
            </Toolbar>
        </AppBar>
    );
};

export default Navigation;
