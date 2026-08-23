import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { PlusCircle, Settings, LogOut, Code2 } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({ totalQuizzes: 0, totalAttempts: 0, averageScore: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, analyticsRes] = await Promise.all([
          api.get('/quizzes/my-quizzes'),
          api.get('/quizzes/admin/analytics')
        ]);
        if (quizRes.data.success) setQuizzes(quizRes.data.quizzes);
        if (analyticsRes.data.success) setAnalytics(analyticsRes.data.analytics || { totalQuizzes: 0, totalAttempts: 0, averageScore: 0 });
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-[var(--color-hr-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Code2 className="text-[var(--color-primary-green)] w-8 h-8" />
              <span className="font-bold text-xl text-[#39424e]">Admin Panel</span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded border border-[var(--color-hr-border)] shadow-sm border-t-4 border-t-[#39424e]">
            <h3 className="text-sm font-bold text-[#738f93] uppercase tracking-wider mb-2">Active Assessments</h3>
            <p className="text-3xl font-extrabold text-[#39424e]">{analytics.totalQuizzes}</p>
          </div>
          <div className="bg-white p-6 rounded border border-[var(--color-hr-border)] shadow-sm border-t-4 border-t-[var(--color-primary-green)]">
            <h3 className="text-sm font-bold text-[#738f93] uppercase tracking-wider mb-2">Total Submissions</h3>
            <p className="text-3xl font-extrabold text-[#39424e]">{analytics.totalAttempts}</p>
          </div>
          <div className="bg-white p-6 rounded border border-[var(--color-hr-border)] shadow-sm border-t-4 border-t-blue-500">
            <h3 className="text-sm font-bold text-[#738f93] uppercase tracking-wider mb-2">Avg. Global Score</h3>
            <p className="text-3xl font-extrabold text-[#39424e]">{Number(analytics.averageScore || 0).toFixed(1)}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#39424e]">Assessment Manager</h2>
          <Link to="/admin/create-quiz" className="btn-primary w-auto px-6 py-2">
            <PlusCircle className="w-4 h-4" /> Create New Assessment
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-[#738f93]">Loading assessments...</div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white p-12 text-center rounded border border-[var(--color-hr-border)]">
            <h3 className="text-lg font-medium text-[#39424e]">No assessments found</h3>
            <p className="mt-2 text-sm text-[#738f93]">Get started by creating your first technical assessment.</p>
          </div>
        ) : (
          <div className="bg-white rounded border border-[var(--color-hr-border)] overflow-hidden">
            <table className="min-w-full divide-y divide-[var(--color-hr-border)]">
              <thead className="bg-[#f9fbfb]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#738f93] uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#738f93] uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#738f93] uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#738f93] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[var(--color-hr-border)]">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-[#f9fbfb] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[#39424e]">{quiz.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#39424e]">
                      {quiz.duration} mins
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#738f93]">
                      {new Date(quiz.createdAt || quiz.createdat).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-4">
                        <Link to={`/admin/analytics/${quiz.id}`} className="text-blue-500 hover:text-blue-700 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg> Analytics
                        </Link>
                        <Link to={`/admin/manage-questions/${quiz.id}`} className="text-[var(--color-primary-green)] hover:text-[var(--color-primary-green-dark)] flex items-center gap-1">
                          <Settings className="w-4 h-4" /> Questions
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
