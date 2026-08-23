import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, LogOut, Code2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For MVP, we will fetch all quizzes (in a real app, only published ones)
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes'); // Needs a new public/student route on backend
        if (res.data.success) setQuizzes(res.data.quizzes);
      } catch (error) {
        console.error('Failed to fetch quizzes', error);
      } finally {
        setLoading(false);
      }
    };
    
    // We actually need a general route to fetch all quizzes for students. 
    // Since we didn't build it in Phase 4, let's just make an API call to get them.
    // Wait, let's fix that by adding a quick route in the backend if needed, or just assuming it exists.
    // Actually, I'll fetch it from a mock API call for now, but wait, the plan said "List published quizzes". 
    // I need to add that route to `quizRoutes.js` in a moment. Let's assume it's `/api/quizzes/published`.
    
    const fetchPublishedQuizzes = async () => {
       try {
         const res = await api.get('/quizzes/published');
         if (res.data.success) setQuizzes(res.data.quizzes);
       } catch (error) {
         console.error('Error fetching quizzes:', error);
       } finally {
         setLoading(false);
       }
    };
    fetchPublishedQuizzes();
  }, []);

  const handleStart = async (quizId) => {
    if(window.confirm('Are you ready to start the timer? You cannot pause the quiz once started.')) {
      try {
        const res = await api.post(`/attempts/start/${quizId}`);
        if(res.data.success) {
          localStorage.setItem(`attempt_${res.data.attemptId}`, JSON.stringify(res.data));
          navigate(`/quiz/${res.data.attemptId}`);
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to start quiz');
      }
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-[var(--color-hr-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Code2 className="text-[var(--color-primary-green)] w-8 h-8" />
              <span className="font-bold text-xl text-[#39424e]">Candidate Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[#738f93]">Hi, {user?.name}</span>
              <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-[#39424e] mb-8">Available Assessments</h1>

        {loading ? (
          <div className="text-center py-10 text-[#738f93]">Loading assessments...</div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white p-12 text-center rounded border border-[var(--color-hr-border)]">
            <h3 className="text-lg font-medium text-[#39424e]">No assessments available</h3>
            <p className="mt-2 text-sm text-[#738f93]">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white border border-[var(--color-hr-border)] rounded shadow-sm flex flex-col">
                <div className="p-6 flex-grow">
                  <h3 className="text-lg font-bold text-[#39424e] mb-2">{quiz.title}</h3>
                  <p className="text-sm text-[#738f93] mb-4 line-clamp-2">{quiz.description}</p>
                  <div className="flex gap-4 text-xs font-semibold text-[#39424e]">
                    <span className="bg-[#f3f7f7] px-2 py-1 rounded">{quiz.duration} mins</span>
                    {quiz.negativeMarking ? (
                      <span className="bg-red-50 text-red-700 px-2 py-1 rounded">Negative Marking</span>
                    ) : (
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded">No Negative Marking</span>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-[var(--color-hr-border)] bg-[#f9fbfb] flex gap-2">
                  <button onClick={() => handleStart(quiz.id)} className="btn-primary py-2 text-sm flex-1">
                    <PlayCircle className="w-4 h-4" /> Start
                  </button>
                  <Link to={`/leaderboard/${quiz.id}`} className="px-4 py-2 bg-white border border-[var(--color-hr-border)] text-[#39424e] font-semibold text-sm rounded hover:bg-[#f3f7f7] transition-colors flex items-center justify-center gap-1">
                    Leaderboard
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
