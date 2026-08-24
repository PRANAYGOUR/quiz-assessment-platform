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
    const [rows] = await pool.query(`
      SELECT q.id, q.title, q.description, q.duration, q.negativemarking as "negativeMarking", q.createdby as "createdBy", q.createdat as "createdAt",
             COUNT(a.id) as "attemptCount",
             ROUND(AVG(a.score), 1) as "avgScore"
      FROM quizzes q
      LEFT JOIN attempts a ON q.id = a.quizid AND a.status = 'SUBMITTED'
      WHERE q.createdby = ?
      GROUP BY q.id
      ORDER BY q.createdat DESC
    `, [adminId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT id, title, description, duration, negativemarking as "negativeMarking", createdby as "createdBy", createdat as "createdAt" FROM quizzes WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = Quiz;
