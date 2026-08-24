const Attempt = require('../models/attemptModel');
const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');

// @desc    Start a quiz attempt
// @route   POST /api/attempts/start/:quizId
// @access  Private/Student
const startQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.quizId;
    const userId = req.user.id;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    // Optional MVP rule: prevent multiple attempts
    // We will allow multiple attempts for now to make testing easier

    const attemptId = await Attempt.create(userId, quizId);
    const attempt = await Attempt.findById(attemptId);
    const questions = await Question.findByQuizId(quizId);

    // Remove correct answers before sending to frontend!
    const sanitizedQuestions = questions.map(q => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });

    res.status(201).json({
      success: true,
      attemptId,
      attempt,
      quiz,
      questions: sanitizedQuestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a quiz and auto-evaluate
// @route   POST /api/attempts/:id/submit
// @access  Private/Student
const submitQuiz = async (req, res, next) => {
  try {
    const attemptId = req.params.id;
    const { answers } = req.body; // Array of { questionId, selectedAnswer }

    const attempt = await Attempt.findById(attemptId);
    
    if (!attempt) {
      res.status(404);
      throw new Error('Attempt not found');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      res.status(400);
      throw new Error('Attempt is already submitted or expired');
    }

    // Verify User owns this attempt
    if (attempt.userId !== req.user.id) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const quiz = await Quiz.findById(attempt.quizId);
    const questions = await Question.findByQuizId(attempt.quizId);

    // SECURITY CHECK: Verify time hasn't expired maliciously
    const startTime = new Date(attempt.startedAt).getTime();
    const currentTime = new Date().getTime();
    const elapsedMinutes = (currentTime - startTime) / 1000 / 60;

    // Allow 1 minute buffer for network latency
    if (elapsedMinutes > quiz.duration + 1) {
      // Mark as expired
      await Attempt.updateResult(attemptId, 0, 0, 'EXPIRED');
      return res.status(400).json({ success: false, message: 'Time expired for this quiz' });
    }

    // EVALUATION ENGINE
    let finalScore = 0;
    let totalMarks = 0;

    // Map correct answers for quick lookup
    const questionMap = {};
    questions.forEach(q => {
      questionMap[q.id] = q;
      totalMarks += q.marks;
    });

    for (const ans of answers) {
      const q = questionMap[ans.questionId];
      if (!q) continue;

      let isCorrect = false;
      let marksAwarded = 0;

      if (ans.selectedAnswer === q.correctAnswer) {
        isCorrect = true;
        marksAwarded = q.marks;
        finalScore += q.marks;
      } else if (ans.selectedAnswer !== null && quiz.negativeMarking) {
        // Simple negative marking: -0.25 of the question's marks (Can be made configurable later)
        marksAwarded = -(q.marks * 0.25);
        finalScore += marksAwarded;
      }

      await Attempt.saveAnswer(attemptId, q.id, ans.selectedAnswer, isCorrect, marksAwarded);
    }

    // Ensure score doesn't drop below 0 if negative marking is harsh
    if (finalScore < 0) finalScore = 0;

    await Attempt.updateResult(attemptId, finalScore, totalMarks, 'SUBMITTED');

    const result = await Attempt.getAttemptResult(attemptId);
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get result of a specific attempt
// @route   GET /api/attempts/:id/result
// @access  Private
const getResult = async (req, res, next) => {
  try {
    const attemptId = req.params.id;
    const result = await Attempt.getAttemptResult(attemptId);
    
    if (!result) {
      res.status(404);
      throw new Error('Result not found');
    }

    // Allow students to see their own, and admins to see all
    if (result.userId !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Unauthorized to view this result');
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startQuiz,
  submitQuiz,
  getResult
};
