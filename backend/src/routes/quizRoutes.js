const express = require('express');
const router = express.Router();
const { createQuiz, getMyQuizzes, addQuestion, getQuizQuestions } = require('../controllers/quizController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All quiz management routes require admin access
router.use(protect, adminOnly);

router.post('/', createQuiz);
router.get('/my-quizzes', getMyQuizzes);
router.post('/:id/questions', addQuestion);
router.get('/:id/questions', getQuizQuestions);

module.exports = router;
