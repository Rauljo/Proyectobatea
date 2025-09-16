import { useState } from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab } from '@mui/material';
import { Link } from "react-router-dom";
import supabase from '../helper/supabase';
import { useNavigate } from 'react-router-dom';


const Navigation = () => {
    const [value, setValue] = useState(0);
    const navigate = useNavigate();

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    return (
        <AppBar position="static">
            <Toolbar sx={{ display: 'flex', justifyContent: 'flex-start', gap: 10 }}>
                {/* "Bateas" alineado a la izquierda */}
                <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Bateas
                    </Typography>
                </Link>
                {/* Espacio entre "Bateas" y las opciones de menú */}
                {/* <Box sx={{ width: '50px' }} /> */}

                {/* Opciones de menú alineadas a la izquierda y en negrita */}
                <Tabs value={value} onChange={handleChange} textColor="inherit">
                    <Tab label="Inserción" sx={{ fontWeight: 'bold' }} component={Link} to="/insercion" />
                    <Tab label="Visualización" sx={{ fontWeight: 'bold' }} component={Link} to="/visualizacion" />
                    <Tab label="Alertas" sx={{ fontWeight: 'bold' }} component={Link} to="/alerts" />
                    <Tab label="Cerrar Sesión" sx= {{ fontWeight: 'bold' }} onClick={handleLogout} />
                </Tabs>

                
            </Toolbar>
        </AppBar>
    );
};

export default Navigation;
