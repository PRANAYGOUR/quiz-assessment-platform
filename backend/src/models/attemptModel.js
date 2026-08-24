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
    const [rows] = await pool.query(
      'SELECT id, userid as "userId", quizid as "quizId", score, totalmarks as "totalMarks", status, startedat as "startedAt", submittedat as "submittedAt" FROM attempts WHERE id = ?',
      [id]
    );
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
      SELECT a.id, a.userid as "userId", a.quizid as "quizId", a.score, a.totalmarks as "totalMarks", a.status, a.startedat as "startedAt", a.submittedat as "submittedAt", q.title as "quizTitle" 
      FROM attempts a 
      JOIN quizzes q ON a.quizid = q.id 
      WHERE a.id = ?
    `, [attemptId]);
    
    if (attemptRows.length === 0) return null;

    const [answerRows] = await pool.query(`
      SELECT ans.id, ans.attemptid as "attemptId", ans.questionid as "questionId", ans.selectedanswer as "selectedAnswer", ans.iscorrect as "isCorrect", ans.marksawarded as "marksAwarded", q.questiontext as "questionText", q.correctanswer as "actualCorrectAnswer" 
      FROM answers ans 
      JOIN questions q ON ans.questionid = q.id 
      WHERE ans.attemptid = ?
    `, [attemptId]);

    return {
      ...attemptRows[0],
      answers: answerRows
    };
  }
}

module.exports = Attempt;
