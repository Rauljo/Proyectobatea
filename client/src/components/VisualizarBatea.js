import { useState } from 'react';
import Grid from '@mui/material/Grid2';
import {
  Box, Typography, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getSectorId } from '../helper/sector';
import { useResponsiveCellSize } from '../helper/useResponsiveCellSize';
import { getSeveridad, vigenciaDays, formatVigencia, gradientColorFor, gradientInkFor } from '../helper/vigencia';

// Un glifo corto por tipo de cuerda: evita que las etiquetas ("Reparque: 12")
// se partan en dos líneas dentro de una celda pequeña.
export const CUERDA_EMOJI = {
  pesca: '🎣',
  cria: '🐚',
  desdoble: '✂️',
  reparque: '📦',
};

const SEVERIDAD_COLOR = {
  ok: { bg: '#c8e6c9', ink: '#2e5c33' },
  atencion: { bg: '#ffe0b2', ink: '#8a5a12' },
  urgente: { bg: '#ffcdd2', ink: '#922b21' },
};

// Para cada sector con cuerdas vigentes: qué tipo es "el peor" (mayor exceso
// sobre su propio umbral, ya que cada tipo puede tener uno distinto) y, por
// separado, la edad más antigua vigente de cada tipo presente (para el
// desglose al tocar el sector).
const construirDatosVigencia = (movimientos, umbrales) => {
  const umbralMap = Object.fromEntries(umbrales.map((u) => [u.tipo_cuerda, u.meses]));
  const peorPorSector = new Map();
  const diasPorSectorYTipo = new Map();

  for (const m of movimientos) {
    if (!m.vigente) continue;
    const umbralMeses = umbralMap[m.tipo_cuerda];
    if (!umbralMeses) continue;

    const dias = vigenciaDays(m.vigencia);
    const key = `${m.sector_row}-${m.sector_col}`;

    if (!diasPorSectorYTipo.has(key)) diasPorSectorYTipo.set(key, new Map());
    const porTipo = diasPorSectorYTipo.get(key);
    if (!porTipo.has(m.tipo_cuerda) || dias > porTipo.get(m.tipo_cuerda)) {
      porTipo.set(m.tipo_cuerda, dias);
    }

    const excess = dias - umbralMeses * 30;
    const actual = peorPorSector.get(key);
    if (!actual || excess > actual.excess) {
      peorPorSector.set(key, { tipo: m.tipo_cuerda, dias, excess, umbralMeses });
    }
  }

  return { peorPorSector, diasPorSectorYTipo };
};

// Desglose por tipo de cuerda de un sector concreto, al tocarlo con el
// coloreado por vigencia activo.
const SectorDetailDialog = ({ open, onClose, sectorId, sector, diasPorTipo, umbralMap }) => {
  const tipos = Object.keys(CUERDA_EMOJI)
    .filter((tipo) => sector?.[`cuerdas_${tipo}`] > 0)
    .map((tipo) => ({
      tipo,
      cantidad: sector[`cuerdas_${tipo}`],
      dias: diasPorTipo?.get(tipo) ?? null,
    }))
    .sort((a, b) => (b.dias ?? -1) - (a.dias ?? -1));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Sector {sectorId}
        <IconButton onClick={onClose} sx={{ marginLeft: 'auto' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {tipos.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Sin cuerdas vigentes en este sector.</Typography>
        ) : (
          tipos.map(({ tipo, cantidad, dias }) => {
            const umbralMeses = umbralMap[tipo];
            const sev = dias !== null && umbralMeses ? getSeveridad({ days: dias }, umbralMeses) : null;
            const color = sev ? SEVERIDAD_COLOR[sev] : null;
            return (
              <Box key={tipo} sx={{ display: 'flex', alignItems: 'center', gap: 1, paddingY: 0.75 }}>
                <Typography sx={{ fontWeight: 'bold', width: '7em', textTransform: 'capitalize' }}>
                  {CUERDA_EMOJI[tipo]} {tipo}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ width: '3em' }}>
                  ×{cantidad}
                </Typography>
                <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {dias !== null ? formatVigencia({ days: dias }) : '—'}
                </Typography>
                {color && (
                  <Typography
                    variant="caption"
                    sx={{
                      marginLeft: 'auto', fontWeight: 'bold',
                      color: color.ink, backgroundColor: color.bg,
                      borderRadius: 10, paddingX: 1, whiteSpace: 'nowrap',
                    }}
                  >
                    {sev === 'ok' ? 'Al día' : sev === 'atencion' ? 'Pasada de plazo' : 'Urgente'}
                  </Typography>
                )}
              </Box>
            );
          })
        )}
      </DialogContent>
    </Dialog>
  );
};

const MatrizSectores = ({ batea, bateaData, vigenciaData, umbrales = [] }) => {
  const totalRow = batea.row_sector;
  const totalCol = batea.col_sector;
  const [detailCell, setDetailCell] = useState(null); // [row, col] | null

  const { containerRef, cellSize, gap } = useResponsiveCellSize(totalCol);
  const umbralMap = Object.fromEntries(umbrales.map((u) => [u.tipo_cuerda, u.meses]));

  const detailSector = detailCell
    ? bateaData.find((s) => s.row === detailCell[0] && s.col === detailCell[1])
    : null;
  const detailDiasPorTipo = detailCell
    ? vigenciaData?.diasPorSectorYTipo.get(`${detailCell[0]}-${detailCell[1]}`)
    : null;

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
          const key = `${row}-${col}`;
          const peor = vigenciaData?.peorPorSector.get(key);

          let backgroundColor = '#e0e0e0';
          let textColor = 'inherit';
          if (vigenciaData) {
            backgroundColor = peor ? gradientColorFor(peor.dias, peor.umbralMeses) : '#f0f0f0';
            textColor = peor ? gradientInkFor(peor.dias, peor.umbralMeses) : 'inherit';
          }

          return (
            <Box
              key={key}
              onClick={peor ? () => setDetailCell([row, col]) : undefined}
              sx={{
                backgroundColor,
                color: textColor,
                borderRadius: '8px',
                textAlign: 'center',
                padding: '8px',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: 1,
                cursor: peor ? 'pointer' : 'default',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <Typography variant="body2" fontWeight="bold">
                  {getSectorId(row, col, totalCol)}
                </Typography>
                {peor && (
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {Math.floor(peor.dias / 30)}m
                  </Typography>
                )}
              </Box>
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
    <SectorDetailDialog
      open={detailCell !== null}
      onClose={() => setDetailCell(null)}
      sectorId={detailCell ? getSectorId(detailCell[0], detailCell[1], totalCol) : null}
      sector={detailSector}
      diasPorTipo={detailDiasPorTipo}
      umbralMap={umbralMap}
    />
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


// El color ya no es de 3 cortes sino un gradiente continuo, así que la
// leyenda es una barra en vez de 3 muestras discretas.
const LeyendaVigencia = () => (
  <Box sx={{ maxWidth: 320, marginTop: 1 }}>
    <Box
      sx={{
        height: 9,
        borderRadius: 10,
        background: 'linear-gradient(to right, hsl(132 46% 78%), hsl(95 46% 78%), hsl(58 55% 76%), hsl(32 65% 74%), hsl(6 62% 74%))',
      }}
    />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 0.5 }}>
      <Typography variant="caption" color="text.secondary">0 meses</Typography>
      <Typography variant="caption" color="text.secondary">umbral</Typography>
      <Typography variant="caption" color="text.secondary">umbral +3m</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, marginTop: 1 }}>
      <Box sx={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: '#f0f0f0', border: '1px solid #ddd' }} />
      <Typography variant="caption" color="text.secondary">Sin cuerdas vigentes</Typography>
    </Box>
    <Typography variant="caption" color="text.secondary" display="block" sx={{ marginTop: 0.5 }}>
      El número junto al sector es la edad (en meses) de la cuerda que marca el color. Toca un sector para ver el desglose por tipo.
    </Typography>
  </Box>
);

const VisualizarBatea = ({ batea, bateaData, movimientos = [], umbrales = [] }) => {
    const [colorear, setColorear] = useState(true);

    const vigenciaData = colorear ? construirDatosVigencia(movimientos, umbrales) : null;

    return (
        <>
            <FormControlLabel
                control={<Switch checked={colorear} onChange={(e) => setColorear(e.target.checked)} />}
                label="Colorear por vigencia"
            />
            {colorear && <LeyendaVigencia />}
            <MatrizSectores batea={batea} bateaData={bateaData} vigenciaData={vigenciaData} umbrales={umbrales} />
        </>
    );
};


export default VisualizarBatea;
export { InfoBateas };