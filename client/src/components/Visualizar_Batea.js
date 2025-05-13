import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid2';
import { Box, Typography, TextField } from '@mui/material';

const MatrizSectores = ({ batea, bateaData }) => {
  const totalX = batea.x_sector;
  const totalY = batea.y_sector;

  // Cuanto mayor sea el número de sectores, menor será el tamaño de celda
  const cellSize = Math.max(40, 100 - Math.max(totalX, totalY) * 2); // Ajustable

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${totalX}, ${cellSize}px)`,
        gap: '6px',
        marginTop: '20px',
        justifyContent: 'center',
      }}
    >
      {Array.from({ length: totalY }).flatMap((_, y) =>
        Array.from({ length: totalX }).map((_, x) => {
          const sector = bateaData.find((s) => s.x === x && s.y === y);

          return (
            <Box
              key={`${x}-${y}`}
              sx={{
                //width: `${cellSize}px`,
                //height: `${cellSize}px`,
                backgroundColor: '#e0e0e0',
                borderRadius: '8px',
                textAlign: 'center',
                padding: '8px',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: 1,
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {x+1} - {y+1}
              </Typography>
              {sector &&
                (sector.cuerdas_pesca > 0 ||
                sector.cuerdas_piedra > 0 ||
                sector.cuerdas_desdoble > 0 ||
                sector.cuerdas_comercial > 0) ? (
                <>
                    {sector.cuerdas_pesca > 0 && (
                    <Typography variant="caption">Pesca: {sector.cuerdas_pesca}</Typography>
                    )}
                    {sector.cuerdas_piedra > 0 && (
                    <Typography variant="caption">Piedra: {sector.cuerdas_piedra}</Typography>
                    )}
                    {sector.cuerdas_desdoble > 0 && (
                    <Typography variant="caption">Desd.: {sector.cuerdas_desdoble}</Typography>
                    )}
                    {sector.cuerdas_comercial > 0 && (
                    <Typography variant="caption">Com.: {sector.cuerdas_comercial}</Typography>
                    )}
                </>
                ) : (
                <Typography variant="caption" color="text.secondary">
                    
                </Typography>
                )}
            </Box>
          );
        })
      )}
    </Box>
  );
};

const Info_Bateas = ({ batea }) => {
    return (
      <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '40px',
                marginX: 'auto',
                marginY: '40px',
                border: '1px solid #ddd', // Borde exterior suave
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                width: '80%',
                maxWidth: '1200px',
            }}
        >
            <div>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
                    Visualizar Batea
                </Typography>

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={6} md={3}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                Nombre
                            </Typography>
                            <Box
                                sx={{
                                    border: '2px solid #bbb', // Borde gris claro
                                    borderRadius: '8px',
                                    padding: '16px',
                                    textAlign: 'center',
                                    backgroundColor: '#f9f9f9',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                <Typography variant="body1">{batea.name}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                Polígono
                            </Typography>
                            <Box
                                sx={{
                                    border: '2px solid #bbb', // Borde gris claro
                                    borderRadius: '8px',
                                    padding: '16px',
                                    textAlign: 'center',
                                    backgroundColor: '#f9f9f9',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                <Typography variant="body1">{batea.polygon}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                X
                            </Typography>
                            <Box
                                sx={{
                                    border: '2px solid #bbb', // Borde gris claro
                                    borderRadius: '8px',
                                    padding: '16px',
                                    textAlign: 'center',
                                    backgroundColor: '#f9f9f9',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                <Typography variant="body1">{batea.x_sector}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                Y
                            </Typography>
                            <Box
                                sx={{
                                    border: '2px solid #bbb', // Borde gris claro
                                    borderRadius: '8px',
                                    padding: '16px',
                                    textAlign: 'center',
                                    backgroundColor: '#f9f9f9',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                <Typography variant="body1">{batea.y_sector}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </div>
        </Box>

    )
  }


const Visualizar_Batea = ({ batea, onlyvisual }) => {

    const [bateaData, setBateaData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!batea) return;

        const fetchBateaData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5010/sectores/${batea.id}`);
                setBateaData(response.data);
            } catch (error) {
                console.error(error.message);
            }
            setLoading(false);
        }

        fetchBateaData();
    }
    , [batea]);

    return (
        <div>
            {loading && <p>Cargando...</p>}
            <Info_Bateas batea={batea} />

            {/* Ahora ponemos la informacion de los sectores */}
            <div>
                <MatrizSectores batea={batea} bateaData={bateaData} onlyvisual={onlyvisual} />
            </div>
        </div>
    );
}



export default Visualizar_Batea;
export { Info_Bateas };