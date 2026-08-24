const pool = require('../config/db');

class Quiz {
  static async create(title, description, duration, negativeMarking, adminId) {
    const [result] = await pool.query(
      'INSERT INTO quizzes (title, description, duration, negativeMarking, createdBy) VALUES (?, ?, ?, ?, ?) RETURNING id',
      [title, description, duration || 30, negativeMarking || false, adminId]
    );
    return result.insertId;
  }

  static async findByAdmin(adminId) {
    const [rows] = await pool.query('SELECT id, title, description, duration, negativemarking as "negativeMarking", createdby as "createdBy", createdat as "createdAt" FROM quizzes WHERE createdby = ? ORDER BY createdat DESC', [adminId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT id, title, description, duration, negativemarking as "negativeMarking", createdby as "createdBy", createdat as "createdAt" FROM quizzes WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = Quiz;
