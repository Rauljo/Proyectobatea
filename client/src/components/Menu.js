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
import { Link, useLocation, useNavigate } from "react-router-dom";
import supabase from '../helper/supabase';

const navItems = [
    { label: 'Inserción', to: '/insercion' },
    { label: 'Visualización', to: '/visualizacion' },
    { label: 'Alertas', to: '/alerts' },
];

const Navigation = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // "/" muestra el mismo contenido que "/insercion", así que se trata igual
    // a la hora de marcar la sección activa.
    const currentPath = location.pathname === '/' ? '/insercion' : location.pathname;
    const activeTab = navItems.some((item) => item.to === currentPath) ? currentPath : false;

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
                    <Tabs value={activeTab} textColor="inherit">
                        {navItems.map((item) => (
                            <Tab key={item.to} value={item.to} label={item.label} sx={{ fontWeight: 'bold' }} component={Link} to={item.to} />
                        ))}
                        <Tab value={false} label="Cerrar Sesión" sx={{ fontWeight: 'bold' }} onClick={handleLogout} />
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
                                <ListItemButton
                                    selected={item.to === currentPath}
                                    component={Link}
                                    to={item.to}
                                    onClick={() => setDrawerOpen(false)}
                                >
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
