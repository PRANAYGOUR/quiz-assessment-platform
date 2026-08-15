const express = require('express');
const router = express.Router();
const { createQuiz, getMyQuizzes, addQuestion, getQuizQuestions, getAvailableQuizzes, getQuizLeaderboard, getAdminAnalytics } = require('../controllers/quizController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

// Student accessible routes
router.get('/published', getAvailableQuizzes); // Using /published to match frontend
router.get('/:id/leaderboard', getQuizLeaderboard); // Both student and admin can see leaderboards

// Admin only routes
router.use(adminOnly);
router.get('/admin/analytics', getAdminAnalytics); // Must be before /:id routes
router.post('/', createQuiz);
router.get('/my-quizzes', getMyQuizzes);
router.post('/:id/questions', addQuestion);
router.get('/:id/questions', getQuizQuestions);

module.exports = router;
