# Bateas Web APP

Projects Webpage: https://victorious-abacus-429.notion.site/Mussels-Growth-Control-Software-2a53193ad0028012b0b9c35101dd0cce

## What it does

Inventory / logistics tool for **mussel rafts (bateas)**. Each raft is a grid of
*sectores* (row × col), and each sector holds counts of four **rope types (cuerdas)**:
`pesca`, `piedra`, `desdoble`, `comercial`. Workers log **movements**
(entrada / salida / intercambio) and the app tracks both live inventory and how long
each rope has been in place (*vigencia*), alerting on ropes that have sat too long.

## Architecture

Three services plus a scheduled report:

- **Client** — React (Create React App) + MUI v6 + react-router v7, deployed on
  **Cloudflare Pages** (`proyectobatea.pages.dev`). Uses Supabase for **auth only**;
  all data goes through the Express API via `REACT_APP_BASE_ENDPOINT`. It attaches the
  Supabase `access_token` as `Authorization: Bearer` on every request.
  Pages: `/login`, `/insercion`, `/visualizacion`, `/alerts`.
- **Server** — Express API on **Render** (`server/index.js`, port 5010).
  `authMiddleware` validates every bearer token via `supabase.auth.getUser`, then routes
  talk to Postgres directly with the `pg` pool (`server/db.js`) through Supabase's
  connection pooler.
- **Database** — Supabase **Postgres** (`server/database.sql`). Tables `bateas` →
  `sectores` (composite PK row/col/batea) → `movimientos`. Core logic lives in Postgres
  **triggers**: stock checks on `salida`, inventory updates, and vigencia recalculation.
- **Weekly report** — GitHub Actions (`.github/workflows/weekly-reports.yml`) runs
  `server/reports/SendReports.js`, which reads current ropes from Supabase and emails an
  HTML summary via Gmail SMTP (nodemailer).

```
React (Cloudflare Pages)  ──Bearer token──►  Express API (Render)  ──pg──►  Supabase Postgres
        └── supabase-js (auth) ──────────────────────────────────────────►  Supabase Auth
GitHub Actions (weekly) ── supabase-js ──►  Supabase  ── SMTP ──►  email report
```

### Environment variables

- Client: `REACT_APP_BASE_ENDPOINT`, `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`
- Server: `DB_PASSWORD`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_USER`, `SUPABASE_HOST`, `SUPABASE_PORT`
- Report (GitHub secrets): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_TO`

## Start Running

Execute 

    npm run dev

Server Folder terminal

    npm start

Client Folder terminal
