import { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { BASE_ENDPOINT } from '../endpoint';
import { useSession } from '../context/SessionContext';
import { getSectorId } from '../helper/sector';
import { formatVigencia } from '../helper/vigencia';
import { toLocalDateString } from '../helper/date';

// now() - fecha nunca produce meses/años, así que basta con los días para comparar
const intervalToSeconds = (v) =>
  v ? (v.days ?? 0) * 86400 + (v.hours ?? 0) * 3600 + (v.minutes ?? 0) * 60 + (v.seconds ?? 0) : 0;

// Día local del movimiento (no el día UTC): agrupa por como lo vería el
// usuario en su calendario, no desplazado por la zona horaria.
const dia = (fecha) => toLocalDateString(new Date(fecha));

// Agrupa por día + operación + tipo de cuerda, sumando cantidad de todos los sectores.
// vigente/vigencia no se pueden fusionar, así que se resumen: cuántas cuerdas siguen
// vigentes y cuál es la más antigua todavía en la batea. Cada grupo conserva los
// movimientos originales para poder desplegarlos.
const agruparMovimientos = (movs, cols) => {
  const groups = new Map();

  for (const m of movs) {
    const key = `${dia(m.fecha)}|${m.operacion}|${m.tipo_cuerda}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        fecha: dia(m.fecha),
        operacion: m.operacion,
        tipo_cuerda: m.tipo_cuerda,
        cantidadTotal: 0,
        vigenteCantidad: 0,
        sectores: new Set(),
        masAntigua: null, // { vigencia, sector }
        movimientos: [],
      });
    }

    const g = groups.get(key);
    const sectorId = getSectorId(m.sector_row, m.sector_col, cols);
    g.cantidadTotal += m.cantidad;
    g.sectores.add(sectorId);
    g.movimientos.push(m);

    if (m.vigente) {
      g.vigenteCantidad += m.cantidad;
      const secs = intervalToSeconds(m.vigencia);
      if (!g.masAntigua || secs > g.masAntigua.secs) {
        g.masAntigua = { secs, vigencia: m.vigencia, sector: sectorId };
      }
    }
  }

  return [...groups.values()].sort((a, b) => b.fecha.localeCompare(a.fecha));
};

const GroupCard = ({ grupo, cols }) => {
  const [open, setOpen] = useState(false);
  const color = grupo.operacion === 'entrada' ? 'green' : 'red';
  const sign = grupo.operacion === 'entrada' ? '+' : '−';

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          padding: 1.5,
          cursor: 'pointer',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ width: '3.4em', flexShrink: 0 }}>
          {grupo.fecha}
        </Typography>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
              {grupo.tipo_cuerda}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 'bold',
                color,
                backgroundColor: grupo.operacion === 'entrada' ? '#e3efe0' : '#f5e5df',
                borderRadius: 10,
                paddingX: 1,
              }}
            >
              {grupo.operacion}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Sector{grupo.sectores.size > 1 ? 'es' : ''} {[...grupo.sectores].sort((a, b) => a - b).join(', ')}
            {grupo.operacion === 'entrada' && ` · ${grupo.vigenteCantidad} de ${grupo.cantidadTotal} vigentes`}
            {grupo.masAntigua && ` · más antigua ${formatVigencia(grupo.masAntigua.vigencia)}`}
          </Typography>
        </Box>

        <Typography sx={{ fontWeight: 'bold', color, flexShrink: 0 }}>
          {sign}{grupo.cantidadTotal}
        </Typography>

        <IconButton size="small">
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'action.hover' }}>
          {grupo.movimientos.map((m) => (
            <Box
              key={m.id}
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 1,
                padding: 1,
                paddingX: 1.5,
                borderBottom: '1px dashed',
                borderColor: 'divider',
                '&:last-of-type': { borderBottom: 'none' },
                fontSize: '0.85rem',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ width: '3.2em', flexShrink: 0 }}>
                {new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', width: '4.5em', flexShrink: 0 }}>
                Sector {getSectorId(m.sector_row, m.sector_col, cols)}
              </Typography>
              <Typography variant="body2" sx={{ width: '2.2em', flexShrink: 0 }}>
                {m.cantidad}
              </Typography>
              {m.operacion === 'entrada' && (
                <Typography
                  variant="caption"
                  sx={{
                    marginLeft: 'auto',
                    fontWeight: 'bold',
                    color: m.vigente ? 'green' : 'red',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.vigente ? `Vigente · ${formatVigencia(m.vigencia)}` : 'Retirado'}
                </Typography>
              )}
              {m.nota && (
                <Typography variant="caption" color="text.secondary" sx={{ width: '100%', flexBasis: '100%' }}>
                  {m.nota}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};


const VisualizarMovimientos = ({batea}) => {

    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { session } = useSession();

    useEffect(() => {
        if (!batea) return;

        const fetchMovimientos = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${BASE_ENDPOINT}/movimientos/${batea.id}?vigencia=true`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                setMovimientos(response.data);
            } catch (error) {
                console.error(error.message);
            }
            setLoading(false);
        }

        fetchMovimientos();
    }
    , [batea, session]);

    const grupos = agruparMovimientos(movimientos, batea.col_sector);

    return (
        <div>
            {loading && <p>Cargando...</p>}
            <h2>Movimientos de la batea {batea.name}</h2>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 640 }}>
                {grupos.map((g) => (
                    <GroupCard key={g.key} grupo={g} cols={batea.col_sector} />
                ))}
            </Box>
        </div>
    )
}

export default VisualizarMovimientos;
