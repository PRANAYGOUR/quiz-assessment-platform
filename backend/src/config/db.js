const { Pool } = require('pg');
require('dotenv').config();

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

pgPool.connect()
  .then(client => {
    console.log('✅ Successfully connected to PostgreSQL / Supabase.');
    client.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to Postgres:', err.message);
  });

// Wrapper to help transition from mysql2 to pg syntax
const pool = {
  query: async (sql, params) => {
    // Automatically convert ? to $1, $2 in simple queries
    let index = 1;
    const pgSql = sql.replace(/\?/g, () => `$${index++}`);
    const result = await pgPool.query(pgSql, params);
    
    // Simulate mysql2 return array: [rows, fields]
    if (result.command === 'INSERT' || result.command === 'UPDATE' || result.command === 'DELETE') {
      return [{ insertId: result.rows[0]?.id, affectedRows: result.rowCount }, result.fields];
    }
    return [result.rows, result.fields];
  }
};

module.exports = pool;
