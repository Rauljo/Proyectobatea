import Grid from '@mui/material/Grid2';
import { Box, Typography } from '@mui/material';
import { getSectorId } from '../helper/sector';
import { useResponsiveCellSize } from '../helper/useResponsiveCellSize';

// Un glifo corto por tipo de cuerda: evita que las etiquetas ("Reparque: 12")
// se partan en dos líneas dentro de una celda pequeña.
const CUERDA_EMOJI = {
  pesca: '🎣',
  cria: '🐚',
  desdoble: '✂️',
  reparque: '📦',
};

const MatrizSectores = ({ batea, bateaData }) => {
  const totalRow = batea.row_sector;
  const totalCol = batea.col_sector;

  const { containerRef, cellSize, gap } = useResponsiveCellSize(totalCol);

  return (
    // Si aun así no caben todas las columnas, este contenedor hace scroll
    // horizontal solo de la rejilla, sin afectar al resto de la página.
    <Box ref={containerRef} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${totalCol}, ${cellSize}px)`,
        gap: `${gap}px`,
        marginTop: '20px',
        justifyContent: 'center',
      }}
    >
      {Array.from({ length: totalRow }).flatMap((_, row) =>
        Array.from({ length: totalCol }).map((_, col) => {
          const sector = bateaData.find((s) => s.col === col && s.row === row);

          return (
            <Box
              key={`${row}-${col}`}
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
                {getSectorId(row, col, totalCol)}
              </Typography>
              {sector && (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    columnGap: '6px',
                    rowGap: '2px',
                    marginTop: '2px',
                  }}
                >
                  {Object.entries(CUERDA_EMOJI).map(([tipo, emoji]) => {
                    const cantidad = sector[`cuerdas_${tipo}`];
                    if (!cantidad) return null;
                    return (
                      <Typography
                        key={tipo}
                        variant="caption"
                        sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                        title={tipo}
                      >
                        {emoji} {cantidad}
                      </Typography>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })
      )}
    </Box>
    </Box>
  );
};

const InfoBateas = ({ batea, sectores }) => {
  // Calcular totales si existen sectores
  const totals = sectores
    ? sectores.reduce(
        (acc, sector) => ({
          cuerdas_pesca: acc.cuerdas_pesca + (sector.cuerdas_pesca || 0),
          cuerdas_cria: acc.cuerdas_cria + (sector.cuerdas_cria || 0),
          cuerdas_desdoble: acc.cuerdas_desdoble + (sector.cuerdas_desdoble || 0),
          cuerdas_reparque: acc.cuerdas_reparque + (sector.cuerdas_reparque || 0),
        }),
        { cuerdas_pesca: 0, cuerdas_cria: 0, cuerdas_desdoble: 0, cuerdas_reparque: 0 }
      )
    : null;

  const renderInfoBox = (label, value) => (
    <Grid item xs={6} md={3}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: { xs: '4px', md: '8px' }, fontSize: { xs: '0.85rem', md: '1rem' } }}>
          {label}
        </Typography>
        <Box
          sx={{
            border: '2px solid #bbb',
            borderRadius: '8px',
            padding: { xs: '8px', md: '16px' },
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            fontSize: { xs: '0.95rem', md: '1.2rem' },
            fontWeight: 'bold',
          }}
        >
          <Typography variant="body1" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>{value}</Typography>
        </Box>
      </Box>
    </Grid>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginY: { xs: '16px', md: '40px' },
        marginX: 'auto',
        border: '1px solid #ddd',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        padding: { xs: '12px', md: '20px' },
        backgroundColor: 'white',
        width: { xs: '100%', md: '80%' },
        maxWidth: '1200px',
      }}
    >
      <div>

        <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center">
          {renderInfoBox('Nombre', batea.name)}
          {renderInfoBox('Polígono', batea.polygon)}
          {renderInfoBox('Filas', batea.row_sector)}
          {renderInfoBox('Columnas', batea.col_sector)}

          {totals && (
            <>
              {renderInfoBox(`${CUERDA_EMOJI.pesca} C. Pesca`, totals.cuerdas_pesca)}
              {renderInfoBox(`${CUERDA_EMOJI.cria} C. Cría`, totals.cuerdas_cria)}
              {renderInfoBox(`${CUERDA_EMOJI.desdoble} C. Desdoble`, totals.cuerdas_desdoble)}
              {renderInfoBox(`${CUERDA_EMOJI.reparque} C. Reparque`, totals.cuerdas_reparque)}
            </>
          )}
        </Grid>
      </div>
    </Box>
  );
};


const VisualizarBatea = ({ batea, bateaData }) => {
    //const [bateaData, setBateaData] = useState([]);
    //const [loading, setLoading] = useState(false);

    
    return (
        <>
            <MatrizSectores batea={batea} bateaData={bateaData} />
        </>
    );
};


export default VisualizarBatea;
export { InfoBateas };