import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BarChart2 } from 'lucide-react';

export default function QuestionAnalytics() {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/quizzes/${id}/question-analytics`);
        if (res.data.success) {
          setAnalytics(res.data.analytics);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading analytics...</div>;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-[#738f93] hover:text-[#39424e] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded border border-[var(--color-hr-border)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-hr-border)] bg-[#f9fbfb]">
            <h2 className="text-xl font-bold text-[#39424e] flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-500" /> Question Analytics
            </h2>
          </div>

          <table className="min-w-full divide-y divide-[var(--color-hr-border)]">
            <thead className="bg-[#f3f7f7]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#738f93] uppercase">Question</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#738f93] uppercase">Difficulty / Category</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#738f93] uppercase">Attempts</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#738f93] uppercase">Accuracy Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[var(--color-hr-border)]">
              {analytics.map((q, idx) => {
                const accuracy = q.totalAttempts > 0 ? ((q.correctAnswers / q.totalAttempts) * 100).toFixed(1) : 0;
                let accColor = 'text-green-600';
                if (accuracy < 40) accColor = 'text-red-600';
                else if (accuracy < 70) accColor = 'text-orange-500';

                return (
                  <tr key={q.questionId} className="hover:bg-[#f9fbfb]">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#39424e] line-clamp-2">Q{idx+1}. {q.questionText}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${q.difficulty === 'Hard' ? 'bg-red-100 text-red-800 border-red-200' : q.difficulty === 'Easy' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-bold text-[#738f93]">{q.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-[#39424e]">
                      {q.totalAttempts}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`text-lg font-extrabold ${accColor}`}>{accuracy}%</div>
                      <div className="text-xs text-[#738f93]">{q.correctAnswers} correct</div>
                    </td>
                  </tr>
                );
              })}
              {analytics.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-[#738f93]">No analytics available for this assessment yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
