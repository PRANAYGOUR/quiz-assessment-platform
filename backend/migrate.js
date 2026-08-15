const pool = require('./src/config/db');

async function migrate() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to DB');
    
    // Check if column exists first to avoid errors
    const [columns] = await connection.query("SHOW COLUMNS FROM `questions` LIKE 'timeLimit'");
    if (columns.length === 0) {
      await connection.query('ALTER TABLE questions ADD COLUMN timeLimit INT DEFAULT 0');
      console.log('✅ Added timeLimit column to questions table');
    } else {
      console.log('⚡ timeLimit column already exists');
    }
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
