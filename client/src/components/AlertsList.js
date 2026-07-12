import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TuneIcon from '@mui/icons-material/Tune';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import axios from 'axios';
import { BASE_ENDPOINT } from '../endpoint';
import { useSession } from '../context/SessionContext';
import { useSelectedBatea } from '../context/SelectedBateaContext';
import { getSectorId } from '../helper/sector';
import { formatVigencia, vigenciaDays, getSeveridad } from '../helper/vigencia';
import { CUERDA_EMOJI } from './VisualizarBatea';

const SEVERIDAD_STYLE = {
  atencion: { label: 'Atención', color: '#9c6a1e', bg: '#f2e6cd' },
  urgente: { label: 'Urgente', color: '#b3462c', bg: '#f5e5df' },
};

const SeveridadChip = ({ severidad }) => {
  const s = SEVERIDAD_STYLE[severidad];
  if (!s) return null;
  return (
    <Typography
      variant="caption"
      sx={{
        fontWeight: 'bold',
        color: s.color,
        backgroundColor: s.bg,
        borderRadius: 10,
        paddingX: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </Typography>
  );
};

// Lo pasada de plazo que va una cuerda, como "+Xm Yd"
const formatExceso = (vigencia, umbralMeses) => {
  const days = vigenciaDays(vigencia) - umbralMeses * 30;
  return `+${formatVigencia({ days: Math.max(0, days) })}`;
};

const BateaCard = ({ batea, onVer }) => {
  const [open, setOpen] = useState(true);
  const urgentes = batea.alertas.filter((a) => a.severidad === 'urgente').length;

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, padding: 1.5, cursor: 'pointer' }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 'bold' }}>{batea.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {batea.alertas.length} alerta{batea.alertas.length === 1 ? '' : 's'}
            {urgentes > 0 && ` · ${urgentes} urgente${urgentes === 1 ? '' : 's'}`}
          </Typography>
        </Box>
        {urgentes > 0 && <SeveridadChip severidad="urgente" />}
        <IconButton
          size="small"
          title="Ver en Visualización"
          onClick={(e) => { e.stopPropagation(); onVer(); }}
        >
          <OpenInNewIcon fontSize="small" />
        </IconButton>
        <IconButton size="small">
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'action.hover' }}>
          {batea.alertas.map((a) => (
            <Box
              key={a.id}
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 1,
                flexWrap: 'wrap',
                padding: 1,
                paddingX: 1.5,
                borderBottom: '1px dashed',
                borderColor: 'divider',
                '&:last-of-type': { borderBottom: 'none' },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold', width: '5em', flexShrink: 0 }}>
                Sector {getSectorId(a.sector_row, a.sector_col, a.col_sector)}
              </Typography>
              <Typography variant="body2" sx={{ width: '6.5em', flexShrink: 0, textTransform: 'capitalize' }}>
                {CUERDA_EMOJI[a.tipo_cuerda]} {a.tipo_cuerda}
              </Typography>
              <Typography variant="body2" sx={{ width: '5.5em', flexShrink: 0 }}>
                {a.cantidad} cuerda{a.cantidad === 1 ? '' : 's'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                {formatVigencia(a.vigencia)} ({formatExceso(a.vigencia, a.umbral_meses)})
              </Typography>
              <Box sx={{ marginLeft: 'auto' }}>
                <SeveridadChip severidad={a.severidad} />
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

const UmbralesEditor = ({ umbrales, onSaved }) => {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const { session } = useSession();

  useEffect(() => {
    setValues(Object.fromEntries(umbrales.map((u) => [u.tipo_cuerda, String(u.meses)])));
  }, [umbrales]);

  const changed = umbrales.filter((u) => values[u.tipo_cuerda] !== String(u.meses));

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const u of changed) {
        await axios.put(`${BASE_ENDPOINT}/umbrales/${u.tipo_cuerda}`,
          { meses: parseInt(values[u.tipo_cuerda]) },
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
      }
      onSaved();
    } catch (err) {
      const message = err.response?.data?.error || 'Error al guardar umbrales';
      alert(`Error: ${message}`);
    }
    setSaving(false);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      {umbrales.map((u) => (
        <TextField
          key={u.tipo_cuerda}
          label={`${CUERDA_EMOJI[u.tipo_cuerda]} ${u.tipo_cuerda}`}
          type="number"
          size="small"
          sx={{ width: '7.5em' }}
          inputProps={{ min: 1 }}
          value={values[u.tipo_cuerda] ?? ''}
          onChange={(e) => setValues((v) => ({ ...v, [u.tipo_cuerda]: e.target.value }))}
        />
      ))}
      <Button
        variant="contained"
        size="small"
        onClick={handleSave}
        disabled={saving || changed.length === 0 || changed.some((u) => {
          const n = parseInt(values[u.tipo_cuerda]);
          return isNaN(n) || n <= 0;
        })}
      >
        Guardar
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
        Meses de vigencia a partir de los cuales una cuerda genera alerta.
      </Typography>
    </Box>
  );
};

const AlertsList = () => {
  const [alerts, setAlerts] = useState([]);
  const [umbrales, setUmbrales] = useState([]);
  const [bateas, setBateas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUmbrales, setShowUmbrales] = useState(false);
  const { session } = useSession();
  const { setSelectedBatea } = useSelectedBatea();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const auth = { headers: { Authorization: `Bearer ${session.access_token}` } };
      const [alertsRes, umbralesRes, bateasRes] = await Promise.all([
        axios.get(`${BASE_ENDPOINT}/alerts`, auth),
        axios.get(`${BASE_ENDPOINT}/umbrales`, auth),
        axios.get(`${BASE_ENDPOINT}/bateas`, auth),
      ]);
      setAlerts(alertsRes.data.map((a) => ({
        ...a,
        severidad: getSeveridad(a.vigencia, a.umbral_meses),
      })));
      setUmbrales(umbralesRes.data);
      setBateas(bateasRes.data);
    } catch (err) {
      console.error('Error al obtener alertas:', err);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVerBatea = (bateaId) => {
    const batea = bateas.find((b) => b.id === bateaId);
    if (!batea) return;
    setSelectedBatea(batea);
    navigate('/visualizacion');
  };

  // Agrupar por batea, ordenando cada grupo y los grupos por gravedad
  const porBatea = [...alerts.reduce((map, a) => {
    if (!map.has(a.batea_id)) {
      map.set(a.batea_id, { batea_id: a.batea_id, name: a.name, alertas: [] });
    }
    map.get(a.batea_id).alertas.push(a);
    return map;
  }, new Map()).values()];

  const totalCuerdas = alerts.reduce((sum, a) => sum + a.cantidad, 0);
  const totalUrgentes = alerts.filter((a) => a.severidad === 'urgente')
    .reduce((sum, a) => sum + a.cantidad, 0);

  return (
    <Box sx={{ padding: { xs: 2, md: 4 }, maxWidth: 760, marginX: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h4" sx={{ flex: 1 }}>
          Alertas
        </Typography>
        <IconButton onClick={() => setShowUmbrales((s) => !s)} title="Configurar umbrales">
          <TuneIcon />
        </IconButton>
      </Box>

      <Collapse in={showUmbrales}>
        <Box sx={{ marginY: 2, padding: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Umbrales de vigencia</Typography>
          <UmbralesEditor umbrales={umbrales} onSaved={fetchData} />
        </Box>
      </Collapse>

      {loading ? (
        <Typography sx={{ marginTop: 2 }}>Cargando...</Typography>
      ) : alerts.length === 0 ? (
        <Box sx={{ marginTop: 3, padding: 3, backgroundColor: '#e3efe0', borderRadius: 2, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', color: '#3f7d4a' }}>
            ✅ Ninguna cuerda pasada de plazo
          </Typography>
        </Box>
      ) : (
        <>
          {/* Resumen */}
          <Box sx={{ marginY: 2, padding: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
            <Typography sx={{ fontWeight: 'bold' }}>
              ⚠️ {totalCuerdas} cuerda{totalCuerdas === 1 ? '' : 's'} pasada{totalCuerdas === 1 ? '' : 's'} de plazo
              en {porBatea.length} batea{porBatea.length === 1 ? '' : 's'}
            </Typography>
            {totalUrgentes > 0 && (
              <Typography variant="body2" sx={{ color: '#b3462c', fontWeight: 'bold' }}>
                {totalUrgentes} urgente{totalUrgentes === 1 ? '' : 's'} (más de un mes pasadas de plazo)
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {porBatea.map((b) => (
              <BateaCard key={b.batea_id} batea={b} onVer={() => handleVerBatea(b.batea_id)} />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default AlertsList;
