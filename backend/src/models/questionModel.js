const pool = require('../config/db');

class Question {
  static async create(quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks, timeLimit, category, difficulty) {
    const [result] = await pool.query(
      'INSERT INTO questions (quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks, timeLimit, category, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id',
      [quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks || 1, timeLimit || 0, category || 'General', difficulty || 'Medium']
    );
    return result.insertId;
  }

  static async findByQuizId(quizId) {
    const [rows] = await pool.query('SELECT * FROM questions WHERE quizId = ?', [quizId]);
    return rows;
  }

  static async update(id, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks, timeLimit, category, difficulty) {
    const [result] = await pool.query(
      'UPDATE questions SET questionText = ?, optionA = ?, optionB = ?, optionC = ?, optionD = ?, correctAnswer = ?, marks = ?, timeLimit = ?, category = ?, difficulty = ? WHERE id = ?',
      [questionText, optionA, optionB, optionC, optionD, correctAnswer, marks || 1, timeLimit || 0, category || 'General', difficulty || 'Medium', id]
    );
    return result.affectedRows > 0;
  }
}
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM questions WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Question;
