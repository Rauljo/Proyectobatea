import Grid from '@mui/material/Grid2';
import { Box, Typography } from '@mui/material';


const MatrizSectores = ({ batea, bateaData }) => {
  const totalRow = batea.row_sector;
  const totalCol = batea.col_sector;

  // Cuanto mayor sea el número de sectores, menor será el tamaño de celda
  const cellSize = Math.max(40, 100 - Math.max(totalCol, totalRow) * 2); // Ajustable

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${totalCol}, ${cellSize}px)`,
        gap: '6px',
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
                {row+1} - {col+1}
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

const InfoBateas = ({ batea, sectores }) => {
  // Calcular totales si existen sectores
  const totals = sectores
    ? sectores.reduce(
        (acc, sector) => ({
          cuerdas_pesca: acc.cuerdas_pesca + (sector.cuerdas_pesca || 0),
          cuerdas_piedra: acc.cuerdas_piedra + (sector.cuerdas_piedra || 0),
          cuerdas_desdoble: acc.cuerdas_desdoble + (sector.cuerdas_desdoble || 0),
          cuerdas_comercial: acc.cuerdas_comercial + (sector.cuerdas_comercial || 0),
        }),
        { cuerdas_pesca: 0, cuerdas_piedra: 0, cuerdas_desdoble: 0, cuerdas_comercial: 0 }
      )
    : null;

  const renderInfoBox = (label, value) => (
    <Grid item xs={6} md={3}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
          {label}
        </Typography>
        <Box
          sx={{
            border: '2px solid #bbb',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}
        >
          <Typography variant="body1">{value}</Typography>
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
        marginTop: '40px',
        marginX: 'auto',
        marginY: '40px',
        border: '1px solid #ddd',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: 'white',
        width: '80%',
        maxWidth: '1200px',
      }}
    >
      <div>

        <Grid container spacing={4} justifyContent="center">
          {renderInfoBox('Nombre', batea.name)}
          {renderInfoBox('Polígono', batea.polygon)}
          {renderInfoBox('Filas', batea.row_sector)}
          {renderInfoBox('Columnas', batea.col_sector)}

          {totals && (
            <>
              {renderInfoBox('C. Pesca', totals.cuerdas_pesca)}
              {renderInfoBox('C. Piedra', totals.cuerdas_piedra)}
              {renderInfoBox('C. Desdoble', totals.cuerdas_desdoble)}
              {renderInfoBox('C. Comercial', totals.cuerdas_comercial)}
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