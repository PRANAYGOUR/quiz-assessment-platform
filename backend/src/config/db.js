const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false } // Auto-enable SSL for cloud databases
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Successfully connected to the MySQL database.');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to MySQL:', err.message);
  });

module.exports = pool;
