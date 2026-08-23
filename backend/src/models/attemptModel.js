const pool = require('../config/db');

class Attempt {
  static async create(userId, quizId) {
    const [result] = await pool.query(
      'INSERT INTO attempts (userId, quizId, status) VALUES (?, ?, ?) RETURNING id',
      [userId, quizId, 'IN_PROGRESS']
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM attempts WHERE id = ?', [id]);
    return rows[0];
  }

  static async updateResult(id, score, totalMarks, status = 'SUBMITTED') {
    await pool.query(
      'UPDATE attempts SET score = ?, totalMarks = ?, status = ?, submittedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [score, totalMarks, status, id]
    );
  }

  static async saveAnswer(attemptId, questionId, selectedAnswer, isCorrect, marksAwarded) {
    await pool.query(
      'INSERT INTO answers (attemptId, questionId, selectedAnswer, isCorrect, marksAwarded) VALUES (?, ?, ?, ?, ?) RETURNING id',
      [attemptId, questionId, selectedAnswer, isCorrect, marksAwarded]
    );
  }

  static async getAttemptResult(attemptId) {
    const [attemptRows] = await pool.query(`
      SELECT a.*, q.title as quizTitle 
      FROM attempts a 
      JOIN quizzes q ON a.quizId = q.id 
      WHERE a.id = ?
    `, [attemptId]);
    
    if (attemptRows.length === 0) return null;

    const [answerRows] = await pool.query(`
      SELECT ans.*, q.questionText, q.correctAnswer as actualCorrectAnswer 
      FROM answers ans 
      JOIN questions q ON ans.questionId = q.id 
      WHERE ans.attemptId = ?
    `, [attemptId]);

    return {
      ...attemptRows[0],
      answers: answerRows
    };
  }
}

module.exports = Attempt;
