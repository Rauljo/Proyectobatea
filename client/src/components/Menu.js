import { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Tabs,
    Tab,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from "react-router-dom";
import supabase from '../helper/supabase';
import { useNavigate } from 'react-router-dom';

const navItems = [
    { label: 'Inserción', to: '/insercion' },
    { label: 'Visualización', to: '/visualizacion' },
    { label: 'Alertas', to: '/alerts' },
];

const Navigation = () => {
    const [value, setValue] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
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
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* "Bateas" alineado a la izquierda */}
                <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Bateas
                    </Typography>
                </Link>

                {/* Menú de escritorio: visible a partir de md */}
                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                    <Tabs value={value} onChange={handleChange} textColor="inherit">
                        {navItems.map((item) => (
                            <Tab key={item.to} label={item.label} sx={{ fontWeight: 'bold' }} component={Link} to={item.to} />
                        ))}
                        <Tab label="Cerrar Sesión" sx={{ fontWeight: 'bold' }} onClick={handleLogout} />
                    </Tabs>
                </Box>

                {/* Botón de menú móvil: visible por debajo de md */}
                <IconButton
                    color="inherit"
                    edge="end"
                    onClick={() => setDrawerOpen(true)}
                    sx={{ display: { xs: 'flex', md: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
            </Toolbar>

            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 240 }} role="presentation">
                    <List>
                        {navItems.map((item) => (
                            <ListItem key={item.to} disablePadding>
                                <ListItemButton component={Link} to={item.to} onClick={() => setDrawerOpen(false)}>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => { setDrawerOpen(false); handleLogout(); }}>
                                <ListItemText primary="Cerrar Sesión" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
        </AppBar>
    );
};

export default Navigation;
