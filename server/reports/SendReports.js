const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

console.log("SUPABASE_URL:", !!process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", !!process.env.SUPABASE_ANON_KEY);
console.log("SMTP_USER:", !!process.env.SMTP_USER);
console.log("EMAIL_TO:", !!process.env.EMAIL_TO);


// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 6 meses ≈ 180 días
const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6

// ==========================
// 2. Obtener movimientos vigentes
// ==========================
async function getVigentes() {
  const { data, error } = await supabase
    .from('movimientos')
    .select(`
      id,
      tipo_cuerda,
      cantidad,
      sector_row,
      sector_col,
      fecha,
      fecha_previa,
      vigente,
      bateas:sector_batea ( name )
    `)
    .eq('vigente', true)

  if (error) throw error
  return data
}

// ==========================
// 3. Calcular vigencia (misma lógica que SQL)
// ==========================
function getVigenciaMs(m) {
  const inicio = m.fecha_previa
    ? new Date(m.fecha_previa)
    : new Date(m.fecha)

  return Date.now() - inicio.getTime()
}

function formatMeses(ms) {
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 30))
}

// ==========================
// 4. Filtrar cuerdas > 6 meses
// ==========================
async function getOldCuerdas() {
  const movimientos = await getVigentes()

  return movimientos
    .map(m => ({
      ...m,
      vigenciaMs: getVigenciaMs(m)
    }))
    .filter(m => m.vigenciaMs >= SIX_MONTHS_MS)
    .sort((a, b) => b.vigenciaMs - a.vigenciaMs)
}

// ==========================
// 5. Generar HTML del email
// ==========================
function generateHtml(cuerdas) {
  if (cuerdas.length === 0) {
    return `
      <p>✅ No hay cuerdas con una vigencia superior a 6 meses.</p>
    `
  }

  const rows = cuerdas.map(m => {
    const inicio = new Date(m.fecha_previa ?? m.fecha)
    const meses = formatMeses(m.vigenciaMs)

    return `
      <tr>
        <td>${m.bateas?.name ?? '-'}</td>
        <td>${m.id}</td>
        <td>${m.tipo_cuerda}</td>
        <td>${m.sector_row} / ${m.sector_col}</td>
        <td>${inicio.toLocaleDateString()}</td>
        <td><strong>${meses}</strong> meses</td>
      </tr>
    `
  }).join('')

  return `
    <h3>📊 Informe semanal – Cuerdas con más de 6 meses de vigencia</h3>
    <p>Total cuerdas afectadas: <strong>${cuerdas.length}</strong></p>

    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Batea</th>
          <th>ID cuerda</th>
          <th>Tipo</th>
          <th>Sector</th>
          <th>Inicio vigencia</th>
          <th>Vigencia</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `
}

// ==========================
// 6. Envío de email
// ==========================
async function sendEmail(html) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  })

  await transporter.sendMail({
    from: `"Informe bateas" <${SMTP_USER}>`,
    to: EMAIL_TO,
    subject: 'Informe semanal de vigencia de cuerdas',
    html
  })
}

// ==========================
// 7. Main
// ==========================
async function main() {
  console.log('⏳ Generando informe semanal de vigencia...')

  const cuerdas = await getOldCuerdas()
  console.log(`🔎 ${cuerdas.length} cuerdas con más de 6 meses`)

  const html = generateHtml(cuerdas)
  await sendEmail(html)

  console.log('✅ Informe enviado correctamente')
}

main().catch(err => {
  console.error('❌ Error en el informe semanal')
  console.error(err)
  process.exit(1)
})

