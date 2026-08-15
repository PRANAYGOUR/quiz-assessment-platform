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
    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, marks } = req.body;

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

    const questionId = await Question.create(quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer, marks);
    
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

module.exports = {
  createQuiz,
  getMyQuizzes,
  addQuestion,
  getQuizQuestions
};
