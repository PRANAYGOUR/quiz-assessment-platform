import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function QuizTaking() {
  const { id } = useParams(); // attemptId
  const navigate = useNavigate();
  
  const [attemptData, setAttemptData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const [submitting, setSubmitting] = useState(false);

  // Initialize Quiz Data
  useEffect(() => {
    // In a real app, the backend should return the ongoing attempt data and time remaining.
    // For this MVP, we pass the data in local state, or fetch it.
    // But since `startQuiz` returns the questions, we should store them when starting.
    // However, if the user refreshes, we lose it.
    // Let's create a robust way: we need a GET /api/attempts/:id to fetch an in-progress attempt.
    // For simplicity, let's assume we can fetch it, OR we just trust the user doesn't refresh.
    // To make this MVP work beautifully without adding another backend route right now, we will use local storage as a cache.
    
    const cachedData = localStorage.getItem(`attempt_${id}`);
    if (cachedData) {
      const data = JSON.parse(cachedData);
      setAttemptData(data.attempt);
      setQuestions(data.questions);
      
      // Calculate remaining time
      const startTime = new Date(data.attempt.startedAt).getTime();
      const endTime = startTime + (data.quiz.duration * 60 * 1000);
      const remainingSecs = Math.floor((endTime - new Date().getTime()) / 1000);
      
      if (remainingSecs <= 0) {
        handleAutoSubmit();
      } else {
        setTimeLeft(remainingSecs);
      }
    } else {
      alert("Attempt data not found in cache. Please restart the quiz.");
      navigate('/dashboard');
    }
  }, [id, navigate]);

  // Timer Countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitting) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, submitting]);

  const handleAutoSubmit = useCallback(async () => {
    if(submitting) return;
    alert("Time is up! Submitting your answers automatically.");
    await submitAnswers();
  }, [submitting]);

  const submitAnswers = async () => {
    setSubmitting(true);
    
    // Format answers array
    const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
      questionId: parseInt(qId),
      selectedAnswer: ans
    }));

    try {
      const res = await api.post(`/attempts/${id}/submit`, { answers: formattedAnswers });
      if (res.data.success) {
        localStorage.removeItem(`attempt_${id}`); // clear cache
        navigate(`/result/${id}`);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting quiz');
      setSubmitting(false);
    }
  };

  const handleOptionSelect = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!questions.length) return <div className="p-10 text-center">Loading quiz environment...</div>;

  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-[#f3f7f7]">
      {/* Header with Timer */}
      <header className="bg-[#39424e] text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow">
        <h1 className="font-bold text-lg">{attemptData?.quizTitle || 'Technical Assessment'}</h1>
        <div className={`flex items-center gap-2 font-mono text-xl ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-[var(--color-primary-green)]'}`}>
          <Clock className="w-5 h-5" />
          {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-6">
        
        {/* Main Question Area */}
        <div className="flex-grow bg-white rounded border border-[var(--color-hr-border)] shadow-sm">
          <div className="p-6 border-b border-[var(--color-hr-border)]">
            <h2 className="text-sm font-bold text-[#738f93] mb-2 uppercase tracking-wide">
              Question {currentIdx + 1} of {questions.length}
            </h2>
            <p className="text-lg font-semibold text-[#39424e]">{currentQ.questionText}</p>
          </div>
          
          <div className="p-6 space-y-4">
            {['A', 'B', 'C', 'D'].map(opt => (
              <label 
                key={opt} 
                className={`flex items-center p-4 rounded border cursor-pointer transition-colors ${answers[currentQ.id] === opt ? 'border-[var(--color-primary-green)] bg-[#f2faf4]' : 'border-[var(--color-hr-border)] hover:bg-[#f9fbfb]'}`}
              >
                <input 
                  type="radio" 
                  name={`question-${currentQ.id}`} 
                  className="w-4 h-4 text-[var(--color-primary-green)] focus:ring-[var(--color-primary-green)]"
                  checked={answers[currentQ.id] === opt}
                  onChange={() => handleOptionSelect(currentQ.id, opt)}
                />
                <span className="ml-3 font-medium text-[#39424e]"><span className="font-bold mr-2">{opt}.</span> {currentQ[`option${opt}`]}</span>
              </label>
            ))}
          </div>

          <div className="p-4 bg-[#f9fbfb] border-t border-[var(--color-hr-border)] flex justify-between items-center">
            <button 
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 font-semibold text-[#738f93] disabled:opacity-50 hover:text-[#39424e]"
            >
              Previous
            </button>
            
            {currentIdx < questions.length - 1 ? (
              <button 
                onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                className="btn-primary w-auto px-6 py-2"
              >
                Next
              </button>
            ) : (
              <button 
                onClick={() => { if(window.confirm("Are you sure you want to submit your final answers?")) submitAnswers() }}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors flex items-center gap-2"
              >
                {submitting ? 'Evaluating...' : <><CheckCircle className="w-4 h-4"/> Submit Final</>}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Navigation Navigator */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded border border-[var(--color-hr-border)] p-4 shadow-sm">
            <h3 className="font-bold text-[#39424e] mb-4 text-center">Question Navigator</h3>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = currentIdx === idx;
                
                let baseClasses = "w-10 h-10 rounded flex items-center justify-center text-sm font-bold border transition-colors cursor-pointer ";
                
                if (isCurrent) {
                  baseClasses += "border-[var(--color-primary-green)] ring-2 ring-[var(--color-primary-green)] ring-offset-1 ";
                }
                
                if (isAnswered) {
                  baseClasses += "bg-[var(--color-primary-green)] text-white border-[var(--color-primary-green)]";
                } else {
                  baseClasses += "bg-white text-[#39424e] border-[var(--color-hr-border)] hover:bg-[#f9fbfb]";
                }

                return (
                  <button 
                    key={q.id} 
                    onClick={() => setCurrentIdx(idx)}
                    className={baseClasses}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 space-y-2 text-xs font-semibold text-[#738f93]">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[var(--color-primary-green)] rounded-sm"></div> Answered</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-[var(--color-hr-border)] rounded-sm"></div> Unanswered</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
