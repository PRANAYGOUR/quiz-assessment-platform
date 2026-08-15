const express = require('express');
const router = express.Router();
const { createQuiz, getMyQuizzes, addQuestion, getQuizQuestions, getAvailableQuizzes } = require('../controllers/quizController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

// Student accessible routes
router.get('/published', getAvailableQuizzes); // Using /published to match frontend

// Admin only routes
router.use(adminOnly);
router.post('/', createQuiz);
router.get('/my-quizzes', getMyQuizzes);
router.post('/:id/questions', addQuestion);
router.get('/:id/questions', getQuizQuestions);

module.exports = router;
