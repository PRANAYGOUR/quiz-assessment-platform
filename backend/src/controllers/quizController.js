const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private/Admin
const createQuiz = async (req, res, next) => {
  try {
    const { title, description, duration, negativeMarking } = req.body;
    
    if (!title || !duration) {
      res.status(400);
      throw new Error('Title and duration are required');
    }

    const quizId = await Quiz.create(title, description, duration, negativeMarking, req.user.id);
    const newQuiz = await Quiz.findById(quizId);
    
    res.status(201).json({ success: true, quiz: newQuiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quizzes for logged in admin
// @route   GET /api/quizzes/my-quizzes
// @access  Private/Admin
const getMyQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.findByAdmin(req.user.id);
    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a question to a quiz
// @route   POST /api/quizzes/:id/questions
// @access  Private/Admin
const addQuestion = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, marks, timeLimit } = req.body;

    // Verify quiz belongs to this admin
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }
    if (quiz.createdBy !== req.user.id) {
      res.status(403);
      throw new Error('You can only add questions to your own quizzes');
    }

    const questionId = await Question.create(quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks, timeLimit);
    
    res.status(201).json({ success: true, message: 'Question added successfully', questionId });
  } catch (error) {
    next(error);
  }
};

// @desc    Get questions for a quiz (Admin view)
// @route   GET /api/quizzes/:id/questions
// @access  Private/Admin
const getQuizQuestions = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const questions = await Question.findByQuizId(quizId);
    res.status(200).json({ success: true, questions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available quizzes for students
// @route   GET /api/quizzes
// @access  Private/Student
const getAvailableQuizzes = async (req, res, next) => {
  try {
    const pool = require('../config/db');
    const [rows] = await pool.query('SELECT id, title, description, duration, negativeMarking, createdAt FROM quizzes ORDER BY createdAt DESC');
    res.status(200).json({ success: true, quizzes: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard for a specific quiz
// @route   GET /api/quizzes/:id/leaderboard
// @access  Private
const getQuizLeaderboard = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const pool = require('../config/db');
    
    const [rows] = await pool.query(`
      SELECT a.id, a.score, a.totalMarks, a.submittedAt, u.name 
      FROM attempts a
      JOIN users u ON a.userId = u.id
      WHERE a.quizId = ? AND a.status = 'SUBMITTED'
      ORDER BY a.score DESC, a.submittedAt ASC
      LIMIT 50
    `, [quizId]);

    res.status(200).json({ success: true, leaderboard: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get high-level analytics for an admin
// @route   GET /api/quizzes/admin/analytics
// @access  Private/Admin
const getAdminAnalytics = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const pool = require('../config/db');

    // Get basic stats for quizzes created by this admin
    const [stats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT q.id) as totalQuizzes,
        COUNT(a.id) as totalAttempts,
        AVG(CASE WHEN a.status = 'SUBMITTED' THEN a.score END) as averageScore
      FROM quizzes q
      LEFT JOIN attempts a ON q.id = a.quizId
      WHERE q.createdBy = ?
    `, [adminId]);

    res.status(200).json({ success: true, analytics: stats[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a specific question
// @route   PUT /api/quizzes/questions/:qId
// @access  Private/Admin
const updateQuestion = async (req, res, next) => {
  try {
    const { qId } = req.params;
    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, marks, timeLimit } = req.body;
    
    // Minimal validation - assume admin has rights for now based on route auth
    const success = await Question.update(qId, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks, timeLimit);
    
    if (success) {
      res.status(200).json({ success: true, message: 'Question updated successfully' });
    } else {
      res.status(404);
      throw new Error('Question not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a specific question
// @route   DELETE /api/quizzes/questions/:qId
// @access  Private/Admin
const deleteQuestion = async (req, res, next) => {
  try {
    const { qId } = req.params;
    const success = await Question.delete(qId);
    
    if (success) {
      res.status(200).json({ success: true, message: 'Question deleted successfully' });
    } else {
      res.status(404);
      throw new Error('Question not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuiz,
  getMyQuizzes,
  addQuestion,
  getQuizQuestions,
  getAvailableQuizzes,
  getQuizLeaderboard,
  getAdminAnalytics,
  updateQuestion,
  deleteQuestion
};
