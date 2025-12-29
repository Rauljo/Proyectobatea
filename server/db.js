const Pool = require('pg').Pool

const pool = new Pool({
    user: process.env.SUPABASE_USER || 'postgres.wpcbligedufvtiwugaso',
    password: process.env.DB_PASSWORD,
    host: process.env.SUPABASE_HOST || 'aws-0-eu-west-3.pooler.supabase.com',
    port: process.env.SUPABASE_PORT || 5432,
    database: 'postgres',
    ssl: {rejectUnauthorized: false}
});

module.exports = pool;