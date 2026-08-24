import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

export default function QuizTaking() {
  const { id } = useParams(); // attemptId
  const navigate = useNavigate();
  
  const [attemptData, setAttemptData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(null); // global timer
  const [questionTimeLeft, setQuestionTimeLeft] = useState(null); // local timer
  const [lockedQuestions, setLockedQuestions] = useState({}); // { qId: true }
  const [submitting, setSubmitting] = useState(false);

  // Initialize Quiz Data
  useEffect(() => {
    const cachedData = localStorage.getItem(`attempt_${id}`);
    if (cachedData) {
      const data = JSON.parse(cachedData);
      setAttemptData(data.attempt);
      
      // Feature: Randomize Questions!
      const shuffled = [...data.questions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      
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

  // Set Local Timer on Question Change
  useEffect(() => {
    if (questions.length > 0) {
      const currentQ = questions[currentIdx];
      // If it has a limit, and it's not already locked
      if (currentQ.timeLimit > 0 && !lockedQuestions[currentQ.id]) {
        setQuestionTimeLeft(currentQ.timeLimit);
      } else {
        setQuestionTimeLeft(null);
      }
    }
  }, [currentIdx, questions, lockedQuestions]);

  // Global Timer Countdown
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

  // Local Timer Countdown
  useEffect(() => {
    if (questionTimeLeft === null || questionTimeLeft <= 0 || submitting) return;
    const timerId = setInterval(() => {
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleLocalTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [questionTimeLeft, submitting]);

  const submitAnswers = async (overrideAnswers = null) => {
    setSubmitting(true);
    const answersToSubmit = overrideAnswers || answers;
    const formattedAnswers = Object.entries(answersToSubmit).map(([qId, ans]) => ({
      questionId: parseInt(qId),
      selectedAnswer: ans
    }));

    try {
      const res = await api.post(`/attempts/${id}/submit`, { answers: formattedAnswers });
      if (res.data.success) {
        localStorage.removeItem(`attempt_${id}`);
        navigate(`/result/${id}`);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting quiz');
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    if(submitting) return;
    alert("Global time is up! Submitting your answers automatically.");
    await submitAnswers();
  }, [submitting, answers]); // Need answers in dependency if used directly, but submitAnswers uses state

  const handleLocalTimeUp = useCallback(() => {
    if(submitting) return;
    const currentQ = questions[currentIdx];
    alert(`Time is up for Question ${currentIdx + 1}! It is now locked.`);
    
    // Lock the question
    setLockedQuestions(prev => ({ ...prev, [currentQ.id]: true }));
    
    // Auto advance
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  }, [currentIdx, questions, submitting]);

  const handleOptionSelect = (qId, option) => {
    if (lockedQuestions[qId]) return; // Cannot change if locked
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!questions.length) return <div className="p-10 text-center">Loading quiz environment...</div>;

  const currentQ = questions[currentIdx];
  const isLocked = lockedQuestions[currentQ.id];

  return (
    <div className="min-h-screen bg-[#f3f7f7]">
      <header className="bg-[#39424e] text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow">
        <h1 className="font-bold text-lg">{attemptData?.quizTitle || 'Technical Assessment'}</h1>
        <div className={`flex items-center gap-2 font-mono text-xl ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-[var(--color-primary-green)]'}`}>
          Global: <Clock className="w-5 h-5 ml-2" /> {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-6">
        
        {/* Main Question Area */}
        <div className="flex-grow bg-white rounded border border-[var(--color-hr-border)] shadow-sm">
          <div className="p-6 border-b border-[var(--color-hr-border)] flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-bold text-[#738f93] uppercase tracking-wide">
                  Question {currentIdx + 1} of {questions.length}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentQ.difficulty === 'Hard' ? 'bg-red-100 text-red-800 border-red-200' : currentQ.difficulty === 'Easy' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                  {currentQ.difficulty || 'Medium'}
                </span>
                <span className="bg-[#e9f2f9] text-[#2c6192] text-[10px] font-bold px-2 py-0.5 rounded border border-[#b8d4ee]">
                  {currentQ.category || 'General'}
                </span>
              </div>
              <p className="text-lg font-semibold text-[#39424e] flex items-center gap-2">
                {isLocked && <Lock className="w-5 h-5 text-red-500" />}
                {currentQ.questionText}
              </p>
            </div>
            
            {/* Feature: Per-Question Local Timer */}
            {questionTimeLeft !== null && !isLocked && (
              <div className={`flex items-center gap-2 font-mono font-bold px-3 py-1 rounded border ${questionTimeLeft <= 10 ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' : 'bg-orange-100 text-orange-600 border-orange-200'}`}>
                <Clock className="w-4 h-4" /> {formatTime(questionTimeLeft)}
              </div>
            )}
            {isLocked && (
              <div className="flex items-center gap-2 font-mono font-bold px-3 py-1 rounded border bg-gray-100 text-gray-500 border-gray-200">
                <Lock className="w-4 h-4" /> Locked
              </div>
            )}
          </div>
          
          <div className="p-6 space-y-4">
            {['A', 'B', 'C', 'D'].map(opt => {
              const isSelected = answers[currentQ.id] === opt;
              let labelClasses = `flex items-center p-4 rounded border transition-colors `;
              
              if (isLocked) {
                labelClasses += isSelected ? 'border-gray-400 bg-gray-100 cursor-not-allowed opacity-75' : 'border-gray-200 cursor-not-allowed opacity-50';
              } else {
                labelClasses += isSelected ? 'border-[var(--color-primary-green)] bg-[#f2faf4] cursor-pointer' : 'border-[var(--color-hr-border)] hover:bg-[#f9fbfb] cursor-pointer';
              }

              return (
                <label key={opt} className={labelClasses}>
                  <input 
                    type="radio" 
                    name={`question-${currentQ.id}`} 
                    className="w-4 h-4 text-[var(--color-primary-green)] focus:ring-[var(--color-primary-green)]"
                    checked={isSelected}
                    onChange={() => handleOptionSelect(currentQ.id, opt)}
                    disabled={isLocked}
                  />
                  <span className="ml-3 font-medium text-[#39424e]"><span className="font-bold mr-2">{opt}.</span> {currentQ[`option${opt}`]}</span>
                </label>
              );
            })}
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

        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded border border-[var(--color-hr-border)] p-4 shadow-sm">
            <h3 className="font-bold text-[#39424e] mb-4 text-center">Navigator</h3>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = currentIdx === idx;
                const isQLocked = lockedQuestions[q.id];
                
                let baseClasses = "w-10 h-10 rounded flex items-center justify-center text-sm font-bold border transition-colors cursor-pointer ";
                
                if (isCurrent) {
                  baseClasses += "border-[var(--color-primary-green)] ring-2 ring-[var(--color-primary-green)] ring-offset-1 ";
                }
                
                if (isQLocked) {
                  baseClasses += isAnswered ? "bg-gray-400 text-white border-gray-400 " : "bg-gray-100 text-gray-400 border-gray-200 ";
                } else if (isAnswered) {
                  baseClasses += "bg-[var(--color-primary-green)] text-white border-[var(--color-primary-green)] ";
                } else {
                  baseClasses += "bg-white text-[#39424e] border-[var(--color-hr-border)] hover:bg-[#f9fbfb] ";
                }

                return (
                  <button 
                    key={q.id} 
                    onClick={() => setCurrentIdx(idx)}
                    className={baseClasses}
                    title={isQLocked ? "Locked" : ""}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
