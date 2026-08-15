const pool = require('./src/config/db');

async function migrate() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to DB');
    
    // Add difficulty
    const [colsDiff] = await connection.query("SHOW COLUMNS FROM `questions` LIKE 'difficulty'");
    if (colsDiff.length === 0) {
      await connection.query("ALTER TABLE questions ADD COLUMN difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium'");
      console.log('✅ Added difficulty column to questions table');
    }
    
    // Add category
    const [colsCat] = await connection.query("SHOW COLUMNS FROM `questions` LIKE 'category'");
    if (colsCat.length === 0) {
      await connection.query("ALTER TABLE questions ADD COLUMN category VARCHAR(100) DEFAULT 'General'");
      console.log('✅ Added category column to questions table');
    }
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
