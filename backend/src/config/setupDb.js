const pool = require('./db');

const setupDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'admin') DEFAULT 'student',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Quizzes Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        duration INT NOT NULL DEFAULT 30,
        negativeMarking BOOLEAN DEFAULT false,
        createdBy INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Questions Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quizId INT NOT NULL,
        questionText TEXT NOT NULL,
        optionA VARCHAR(255) NOT NULL,
        optionB VARCHAR(255) NOT NULL,
        optionC VARCHAR(255) NOT NULL,
        optionD VARCHAR(255) NOT NULL,
        correctAnswer ENUM('A', 'B', 'C', 'D') NOT NULL,
        marks INT DEFAULT 1,
        FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
      )
    `);

    // Create Attempts Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        quizId INT NOT NULL,
        startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submittedAt TIMESTAMP NULL,
        score DECIMAL(5,2) DEFAULT 0,
        totalMarks INT DEFAULT 0,
        status ENUM('IN_PROGRESS', 'SUBMITTED', 'EXPIRED') DEFAULT 'IN_PROGRESS',
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
      )
    `);

    // Create Answers Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        attemptId INT NOT NULL,
        questionId INT NOT NULL,
        selectedAnswer ENUM('A', 'B', 'C', 'D') NULL,
        isCorrect BOOLEAN DEFAULT false,
        marksAwarded DECIMAL(5,2) DEFAULT 0,
        FOREIGN KEY (attemptId) REFERENCES attempts(id) ON DELETE CASCADE,
        FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Users, Quizzes, Questions, Attempts, and Answers tables ready');
    connection.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    process.exit(1);
  }
};

setupDatabase();
