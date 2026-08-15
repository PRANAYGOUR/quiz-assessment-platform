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

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes/my-quizzes');
        if (res.data.success) setQuizzes(res.data.quizzes);
      } catch (error) {
        console.error('Failed to fetch quizzes', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#39424e]">Your Assessments</h1>
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
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/admin/manage-questions/${quiz.id}`} className="text-[var(--color-primary-green)] hover:text-[var(--color-primary-green-dark)] flex items-center justify-end gap-1">
                        <Settings className="w-4 h-4" /> Manage Questions
                      </Link>
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
