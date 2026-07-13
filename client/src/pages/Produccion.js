import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import SelectorMenu from '../components/SelectorMenu';
import { CUERDA_EMOJI } from '../components/VisualizarBatea';
import { BASE_ENDPOINT } from '../endpoint';
import { useSession } from '../context/SessionContext';
import { useSelectedBatea } from '../context/SelectedBateaContext';
import { getSectorId } from '../helper/sector';
import { toLocalDateString } from '../helper/date';
import { formatVigencia } from '../helper/vigencia';
import { TIPOS_SACO, SACO_LABEL } from '../helper/sacos';

const dia = (fecha) => toLocalDateString(new Date(fecha));

// Las entradas retiradas guardan en la nota "Retirado <fecha> mov <id>" con el
// id de la salida que las retiró: con eso ligamos cada día de producción con
// las cuerdas concretas que se sacaron y su tiempo en el mar.
const getSalidaRetiradora = (nota) => {
  const match = nota?.match(/mov (\d+)$/);
  return match ? parseInt(match[1]) : null;
};

// ---------- Formulario de registro ----------

const RegistroForm = ({ batea, onRegistered }) => {
  const [fecha, setFecha] = useState(() => toLocalDateString(new Date()));
  const [cantidades, setCantidades] = useState({});
  const [nota, setNota] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { session } = useSession();

  const sacos = TIPOS_SACO
    .filter((t) => parseInt(cantidades[t.value]) > 0)
    .map((t) => ({ tipo_saco: t.value, cantidad: parseInt(cantidades[t.value]) }));

  const totalSacos = sacos.reduce((sum, s) => sum + s.cantidad, 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${BASE_ENDPOINT}/producciones`,
        { fecha, batea: batea.id, sacos, nota },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      // La fecha se mantiene (varios registros del mismo día); se limpian cantidades
      setCantidades({});
      setNota('');
      onRegistered();
    } catch (err) {
      const message = err.response?.data?.error || 'Error al registrar la producción';
      alert(`Error: ${message}`);
    }
    setSubmitting(false);
  };

  return (
    <Card sx={{ width: { xs: '100%', sm: 440 }, maxWidth: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Registrar producción
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Batea: {batea.name}
        </Typography>

        <TextField
          label="Fecha"
          type="date"
          fullWidth
          sx={{ mt: 1 }}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {TIPOS_SACO.map((t) => (
            <Grid item xs={6} key={t.value}>
              <TextField
                label={t.label}
                type="number"
                fullWidth
                inputProps={{ min: 0 }}
                value={cantidades[t.value] ?? ''}
                onChange={(e) =>
                  setCantidades((c) => ({ ...c, [t.value]: e.target.value }))
                }
              />
            </Grid>
          ))}
        </Grid>

        <TextField
          label="Nota (opcional)"
          fullWidth
          sx={{ mt: 2 }}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleSubmit}
          disabled={sacos.length === 0 || submitting}
        >
          {totalSacos > 0
            ? `Registrar ${totalSacos} saco${totalSacos === 1 ? '' : 's'}`
            : 'Registrar producción'}
        </Button>
      </CardContent>
    </Card>
  );
};

// ---------- Tarjeta de un día de producción ----------

const DiaCard = ({ fecha, entradas: rows, movimientos, cols, onDelete }) => {
  const [open, setOpen] = useState(false);

  const totalSacos = rows.reduce((sum, r) => sum + r.cantidad, 0);

  // Movimientos de ese mismo día en esta batea
  const salidasDia = movimientos.filter(
    (m) => m.operacion === 'salida' && dia(m.fecha) === fecha
  );
  const salidaIds = new Set(salidasDia.map((s) => s.id));
  const retiradas = movimientos.filter(
    (m) => m.operacion === 'entrada' && m.vigente === false && salidaIds.has(getSalidaRetiradora(m.nota))
  );

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, padding: 1.5, cursor: 'pointer' }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 'bold' }}>{fecha}</Typography>
          <Typography variant="caption" color="text.secondary">
            {totalSacos} saco{totalSacos === 1 ? '' : 's'}
            {salidasDia.length > 0
              ? ` · ${salidasDia.length} salida${salidasDia.length === 1 ? '' : 's'} ese día`
              : ' · sin salidas registradas ese día'}
          </Typography>
        </Box>
        <IconButton size="small">
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'action.hover', padding: 1.5 }}>

          {/* Sacos registrados */}
          <Typography variant="subtitle2" gutterBottom>Sacos</Typography>
          {rows.map((r) => (
            <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, paddingY: 0.25 }}>
              <Typography variant="body2" sx={{ flex: 1 }}>
                {SACO_LABEL[r.tipo_saco] ?? r.tipo_saco}: <strong>{r.cantidad}</strong>
                {r.nota && (
                  <Typography component="span" variant="caption" color="text.secondary">
                    {' '}· {r.nota}
                  </Typography>
                )}
              </Typography>
              <IconButton
                size="small"
                title="Eliminar registro"
                onClick={() => onDelete(r)}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}

          {/* Salidas del día */}
          {salidasDia.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 1.5 }} gutterBottom>
                Salidas de ese día
              </Typography>
              {salidasDia.map((s) => (
                <Typography key={s.id} variant="body2">
                  {CUERDA_EMOJI[s.tipo_cuerda]} {s.tipo_cuerda} · sector {getSectorId(s.sector_row, s.sector_col, cols)} · {s.cantidad} cuerda{s.cantidad === 1 ? '' : 's'}
                </Typography>
              ))}
            </>
          )}

          {/* Cuerdas retiradas por esas salidas, con su tiempo en el mar */}
          {retiradas.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 1.5 }} gutterBottom>
                Cuerdas retiradas (tiempo en el mar)
              </Typography>
              {retiradas.map((m) => (
                <Typography key={m.id} variant="body2">
                  {CUERDA_EMOJI[m.tipo_cuerda]} {m.tipo_cuerda} · sector {getSectorId(m.sector_row, m.sector_col, cols)} · {m.cantidad} cuerda{m.cantidad === 1 ? '' : 's'} · <strong>{formatVigencia(m.vigencia)}</strong> en el mar
                </Typography>
              ))}
            </>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

// ---------- Página ----------

const Produccion = () => {
  const { selectedBatea, setSelectedBatea } = useSelectedBatea();
  const [bateas, setBateas] = useState([]);
  const [producciones, setProducciones] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const { session } = useSession();

  useEffect(() => {
    const fetchBateas = async () => {
      try {
        const response = await axios.get(`${BASE_ENDPOINT}/bateas`,
          { headers: { Authorization: `Bearer ${session.access_token}` } });
        setBateas(response.data);
      } catch (error) {
        console.error("Error fetching bateas:", error.message);
      }
    };
    fetchBateas();
  }, [session]);

  const fetchData = useCallback(async () => {
    if (!selectedBatea) return;
    try {
      const auth = { headers: { Authorization: `Bearer ${session.access_token}` } };
      const [prodRes, movRes] = await Promise.all([
        axios.get(`${BASE_ENDPOINT}/producciones/${selectedBatea.id}`, auth),
        axios.get(`${BASE_ENDPOINT}/movimientos/${selectedBatea.id}?vigencia=true`, auth),
      ]);
      setProducciones(prodRes.data);
      setMovimientos(movRes.data);
    } catch (error) {
      console.error("Error fetching producción:", error.message);
    }
  }, [selectedBatea, session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (row) => {
    const label = SACO_LABEL[row.tipo_saco] ?? row.tipo_saco;
    if (!window.confirm(`¿Eliminar el registro de ${row.cantidad} sacos (${label})?`)) return;
    try {
      await axios.delete(`${BASE_ENDPOINT}/producciones/${row.id}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } });
      fetchData();
    } catch (err) {
      const message = err.response?.data?.error || 'Error al eliminar';
      alert(`Error: ${message}`);
    }
  };

  // Agrupar producciones por día (más reciente primero)
  const porDia = [...producciones.reduce((map, p) => {
    const key = dia(p.fecha);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
    return map;
  }, new Map()).entries()].sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          marginTop: { xs: '24px', md: '80px' },
          paddingX: 2,
        }}
      >
        <SelectorMenu onSelectBatea={setSelectedBatea} bateas={bateas} />
      </Box>

      {selectedBatea && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'center',
            alignItems: { xs: 'stretch', md: 'flex-start' },
            gap: 4,
            marginTop: '40px',
            paddingX: { xs: 2, md: 4 },
          }}
        >
          <RegistroForm batea={selectedBatea} onRegistered={fetchData} />

          <Box sx={{ width: { xs: '100%', md: 520 }, maxWidth: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Historial de producción
            </Typography>
            {porDia.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Sin producciones registradas para esta batea.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {porDia.map(([fecha, rows]) => (
                  <DiaCard
                    key={fecha}
                    fecha={fecha}
                    entradas={rows}
                    movimientos={movimientos}
                    cols={selectedBatea.col_sector}
                    onDelete={handleDelete}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </div>
  );
};

export default Produccion;
