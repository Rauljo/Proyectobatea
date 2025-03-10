const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres',
    password: 'TMotox1247',
    host: 'localhost',
    port: 5432,
    database: 'bateas'
});

module.exports = pool;