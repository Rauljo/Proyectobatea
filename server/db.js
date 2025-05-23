const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres.wpcbligedufvtiwugaso',
    password: process.env.DB_PASSWORD,
    host: 'aws-0-eu-west-3.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: {rejectUnauthorized: false}
});

module.exports = pool;