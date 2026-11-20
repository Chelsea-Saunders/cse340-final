import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.query('SELECT NOW()')
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error(
        'Datebase connection error:', err.message
));

export default pool;