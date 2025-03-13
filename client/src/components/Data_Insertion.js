import React, {Fragment} from 'react';
import { Box } from '@mui/material'; // Asegúrate de importar Box

import Selector_Menu from './Selector_Menu.js';
import Nueva_Batea from './Nueva_Batea.js';
import Visualizar_Batea from './Visualizar_Batea.js';



const Data_Insertion = () => {
    const [selectedBatea, setSelected] = React.useState(null);

    const handleSelectBatea = (batea) => {
        setSelected(batea);
    };



    return (
        <>
            <Box
                sx={{
                    display: 'flex', // Establece el layout horizontal
                    justifyContent: 'center', // Centra los elementos horizontalmente
                    alignItems: 'center', // Centra los elementos verticalmente
                    gap: 4, // Espacio entre los elementos (puedes ajustar este valor)
                    marginTop: '80px', // Espacio entre la Toolbar y el contenido (ajusta según el tamaño de la Toolbar)
                }}
            >
                <Selector_Menu onSelectBatea={handleSelectBatea} />
                <Nueva_Batea />
            </Box>
            
            {selectedBatea && (
            <Box
                sx={{
                    display: 'flex', // Flexbox también para este elemento
                    justifyContent: 'center', // Centra el contenido
                    alignItems: 'center', // Centra el contenido verticalmente
                    marginTop: '40px', // Espacio extra después de los elementos previos
                    marginX: 'auto', // Centra el Box en el contenedor
                    marginY: '40px', // Margen vertical (ajústalo para mayor espacio con respecto al resto de la página)
                    border: '1px solid #ddd', // Borde suave alrededor del Box
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Sombra sutil para darle efecto flotante
                    borderRadius: '8px', // Bordes redondeados para mayor suavidad
                    padding: '20px', // Espaciado interno para no pegar el contenido al borde
                    backgroundColor: 'white', // Fondo blanco para hacerlo destacar
                    width: '80%', // Ancho del contenedor (ajústalo según tu preferencia)
                    maxWidth: '20000px', // Limita el tamaño máximo del contenedor
                }}
            >
                <Visualizar_Batea batea={selectedBatea} />
            </Box>
        )}
            
        </>
    );
}

export default Data_Insertion;