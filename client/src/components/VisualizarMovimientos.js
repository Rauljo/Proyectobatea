import { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { BASE_ENDPOINT } from '../endpoint';
import { useSession } from '../context/SessionContext';
import { getSectorId } from '../helper/sector';
import { formatVigencia } from '../helper/vigencia';

// now() - fecha nunca produce meses/años, así que basta con los días para comparar
const intervalToSeconds = (v) =>
  v ? (v.days ?? 0) * 86400 + (v.hours ?? 0) * 3600 + (v.minutes ?? 0) * 60 + (v.seconds ?? 0) : 0;

const dia = (fecha) => new Date(fecha).toISOString().split('T')[0];

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


const GroupRow = ({ grupo, cols }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        hover
        onClick={() => setOpen((o) => !o)}
        sx={{ cursor: 'pointer', '& > *': { borderBottom: 'unset' } }}
      >
        <TableCell>
          <IconButton size="small">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{grupo.fecha}</TableCell>
        <TableCell>{grupo.tipo_cuerda}</TableCell>
        <TableCell
          sx={{
            color: grupo.operacion === "entrada" ? "green" : "red",
            fontWeight: "bold"
          }}
        >
          {grupo.operacion}
        </TableCell>
        <TableCell>{grupo.cantidadTotal}</TableCell>
        <TableCell>{[...grupo.sectores].sort((a, b) => a - b).join(', ')}</TableCell>
        <TableCell>
          {grupo.operacion === 'entrada'
            ? `${grupo.vigenteCantidad} de ${grupo.cantidadTotal}`
            : '—'}
        </TableCell>
        <TableCell>
          {grupo.masAntigua
            ? `${formatVigencia(grupo.masAntigua.vigencia)} (sector ${grupo.masAntigua.sector})`
            : '—'}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Hora</strong></TableCell>
                    <TableCell><strong>Sector</strong></TableCell>
                    <TableCell><strong>Cantidad</strong></TableCell>
                    <TableCell><strong>Fecha Previa</strong></TableCell>
                    <TableCell><strong>Nota</strong></TableCell>
                    <TableCell><strong>Vigente</strong></TableCell>
                    <TableCell><strong>Vigencia</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grupo.movimientos.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{new Date(m.fecha).toLocaleTimeString()}</TableCell>
                      <TableCell>{getSectorId(m.sector_row, m.sector_col, cols)}</TableCell>
                      <TableCell>{m.cantidad}</TableCell>
                      <TableCell>{m.fecha_previa}</TableCell>
                      <TableCell>{m.nota}</TableCell>
                      <TableCell>
                        {m.operacion === 'entrada' ? (
                          m.vigente ? (
                            <span style={{ color: "green", fontWeight: "bold" }}>Sí</span>
                          ) : (
                            <span style={{ color: "red", fontWeight: "bold" }}>No</span>
                          )
                        ) : null}
                      </TableCell>
                      <TableCell>{formatVigencia(m.vigencia)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
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
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell><strong>Fecha</strong></TableCell>
                            <TableCell><strong>Tipo de cuerda</strong></TableCell>
                            <TableCell><strong>Operación</strong></TableCell>
                            <TableCell><strong>Cantidad</strong></TableCell>
                            <TableCell><strong>Sectores</strong></TableCell>
                            <TableCell><strong>Vigentes</strong></TableCell>
                            <TableCell><strong>Más antigua</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {grupos.map((g) => (
                            <GroupRow key={g.key} grupo={g} cols={batea.col_sector} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}

export default VisualizarMovimientos;
