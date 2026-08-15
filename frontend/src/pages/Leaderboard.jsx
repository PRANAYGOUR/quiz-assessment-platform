import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Trophy, ArrowLeft, Medal } from 'lucide-react';

export default function Leaderboard() {
  const { id } = useParams(); // quizId
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get(`/quizzes/${id}/leaderboard`);
        if (res.data.success) {
          setLeaderboard(res.data.leaderboard);
        }
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [id]);

  if (loading) return <div className="text-center p-10 font-bold text-[#738f93]">Loading Standings...</div>;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-[#738f93] hover:text-[#39424e] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded border border-[var(--color-hr-border)] shadow-sm overflow-hidden">
          <div className="bg-[#39424e] px-8 py-6 text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold">Global Leaderboard</h1>
              <p className="text-[#738f93] text-sm mt-1">Ranking all attempts for this assessment</p>
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-12 text-center text-[#738f93]">
              <p>No one has completed this assessment yet.</p>
              <p className="font-bold mt-2">Be the first!</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-[var(--color-hr-border)]">
              <thead className="bg-[#f9fbfb]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#738f93] uppercase tracking-wider w-24">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#738f93] uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[#738f93] uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[#738f93] uppercase tracking-wider">Date Submitted</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[var(--color-hr-border)]">
                {leaderboard.map((entry, idx) => {
                  const isTop3 = idx < 3;
                  let rankColor = "text-[#39424e]";
                  if (idx === 0) rankColor = "text-yellow-500";
                  if (idx === 1) rankColor = "text-gray-400";
                  if (idx === 2) rankColor = "text-amber-600";

                  return (
                    <tr key={entry.id} className="hover:bg-[#f9fbfb] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center font-bold text-lg ${rankColor}`}>
                          {isTop3 ? <Medal className="w-5 h-5 mr-1" /> : <span className="w-6 text-center">{idx + 1}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-semibold ${idx === 0 ? 'text-[#39424e] text-base' : 'text-[#738f93] text-sm'}`}>
                          {entry.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-mono font-bold text-[var(--color-primary-green)]">
                          {entry.score} <span className="text-xs text-[#738f93]">/ {entry.totalMarks}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium text-[#738f93]">
                        {new Date(entry.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
