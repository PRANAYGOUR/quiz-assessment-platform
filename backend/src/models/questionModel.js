const pool = require('../config/db');

class Question {
  static async create(quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks, timeLimit) {
    const [result] = await pool.query(
      'INSERT INTO questions (quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks, timeLimit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks || 1, timeLimit || 0]
    );
    return result.insertId;
  }

  static async findByQuizId(quizId) {
    const [rows] = await pool.query('SELECT * FROM questions WHERE quizId = ?', [quizId]);
    return rows;
  }

  static async update(id, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks, timeLimit) {
    const [result] = await pool.query(
      'UPDATE questions SET questionText = ?, optionA = ?, optionB = ?, optionC = ?, optionD = ?, correctAnswer = ?, marks = ?, timeLimit = ? WHERE id = ?',
      [questionText, optionA, optionB, optionC, optionD, correctAnswer, marks || 1, timeLimit || 0, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM questions WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Question;
