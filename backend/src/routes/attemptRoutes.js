const express = require('express');
const router = express.Router();
const { startQuiz, submitQuiz, getResult } = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/start/:quizId', startQuiz);
router.post('/:id/submit', submitQuiz);
router.get('/:id/result', getResult);

module.exports = router;
