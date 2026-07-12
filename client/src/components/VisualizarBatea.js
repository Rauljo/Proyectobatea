import { useState } from 'react';
import Grid from '@mui/material/Grid2';
import { Box, Typography, Switch, FormControlLabel } from '@mui/material';
import { getSectorId } from '../helper/sector';
import { useResponsiveCellSize } from '../helper/useResponsiveCellSize';
import { getSeveridad } from '../helper/vigencia';

// Un glifo corto por tipo de cuerda: evita que las etiquetas ("Reparque: 12")
// se partan en dos líneas dentro de una celda pequeña.
export const CUERDA_EMOJI = {
  pesca: '🎣',
  cria: '🐚',
  desdoble: '✂️',
  reparque: '📦',
};

// Colores de fondo de celda según el estado de la peor cuerda del sector
const ESTADO_COLOR = {
  ok: '#c8e6c9',       // al día
  atencion: '#ffe0b2', // pasada de plazo
  urgente: '#ffcdd2',  // más de un mes pasada de plazo
};
const ESTADO_RANK = { ok: 1, atencion: 2, urgente: 3 };

// Peor severidad por sector ("row-col" -> 'ok' | 'atencion' | 'urgente')
// entre las cuerdas vigentes, comparando cada una con el umbral de su tipo.
const calcularEstados = (movimientos, umbrales) => {
  const umbralMap = Object.fromEntries(umbrales.map((u) => [u.tipo_cuerda, u.meses]));
  const estados = new Map();

  for (const m of movimientos) {
    if (!m.vigente) continue;
    const umbral = umbralMap[m.tipo_cuerda];
    if (!umbral) continue;

    const sev = getSeveridad(m.vigencia, umbral);
    const key = `${m.sector_row}-${m.sector_col}`;
    if (!estados.has(key) || ESTADO_RANK[sev] > ESTADO_RANK[estados.get(key)]) {
      estados.set(key, sev);
    }
  }

  return estados;
};

const MatrizSectores = ({ batea, bateaData, estados }) => {
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
          // Con el coloreado activo, celda según la peor cuerda del sector;
          // sin cuerdas vigentes queda en un gris más claro que el normal.
          const estado = estados ? estados.get(`${row}-${col}`) : null;
          const backgroundColor = estados
            ? (ESTADO_COLOR[estado] ?? '#f0f0f0')
            : '#e0e0e0';

          return (
            <Box
              key={`${row}-${col}`}
              sx={{
                //width: `${cellSize}px`,
                //height: `${cellSize}px`,
                backgroundColor,
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
          {renderInfoBox('Zona', batea.zona)}
          {renderInfoBox('Polígono', batea.polygon)}
          {renderInfoBox('Cuadrante', batea.cuadrante)}
          {renderInfoBox('Distrito', batea.distrito)}
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


const LeyendaVigencia = () => (
  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 1 }}>
    {[
      ['ok', 'Al día'],
      ['atencion', 'Pasada de plazo'],
      ['urgente', 'Urgente (+1 mes)'],
    ].map(([estado, label]) => (
      <Box key={estado} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: ESTADO_COLOR[estado] }} />
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </Box>
    ))}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: '#f0f0f0', border: '1px solid #ddd' }} />
      <Typography variant="caption" color="text.secondary">Sin cuerdas</Typography>
    </Box>
  </Box>
);

const VisualizarBatea = ({ batea, bateaData, movimientos = [], umbrales = [] }) => {
    const [colorear, setColorear] = useState(true);

    const estados = colorear ? calcularEstados(movimientos, umbrales) : null;

    return (
        <>
            <FormControlLabel
                control={<Switch checked={colorear} onChange={(e) => setColorear(e.target.checked)} />}
                label="Colorear por vigencia"
            />
            {colorear && <LeyendaVigencia />}
            <MatrizSectores batea={batea} bateaData={bateaData} estados={estados} />
        </>
    );
};


export default VisualizarBatea;
export { InfoBateas };