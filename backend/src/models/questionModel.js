const pool = require('../config/db');

class Question {
  static async create(quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks) {
    const [result] = await pool.query(
      'INSERT INTO questions (quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks || 1]
    );
    return result.insertId;
  }

  static async findByQuizId(quizId) {
    const [rows] = await pool.query('SELECT * FROM questions WHERE quizId = ?', [quizId]);
    return rows;
  }
}

module.exports = Question;
