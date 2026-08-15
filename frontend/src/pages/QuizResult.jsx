import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

export default function QuizResult() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/attempts/${id}/result`);
        if (res.data.success) {
          setResult(res.data.result);
        }
      } catch (error) {
        console.error("Failed to fetch result", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#738f93]">Analyzing Submission...</div>;
  if (!result) return <div className="text-center p-10 text-red-600">Failed to load result.</div>;

  const percentage = Math.round((result.score / result.totalMarks) * 100);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-[#738f93] hover:text-[#39424e] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        
        {/* Score Card */}
        <div className="bg-white p-8 rounded border border-[var(--color-hr-border)] text-center shadow-sm mb-8">
          <h1 className="text-3xl font-extrabold text-[#39424e] mb-2">{result.quizTitle}</h1>
          <p className="text-sm font-bold text-[#738f93] uppercase tracking-widest mb-8">Final Result</p>
          
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-[var(--color-primary-green)] mb-6">
            <span className="text-4xl font-extrabold text-[var(--color-primary-green)]">{percentage}%</span>
          </div>
          
          <div className="flex justify-center gap-12 text-lg font-bold text-[#39424e]">
            <div>
              <span className="text-3xl">{result.score}</span>
              <span className="block text-xs text-[#738f93] uppercase">Marks Earned</span>
            </div>
            <div>
              <span className="text-3xl text-[var(--color-hr-border)]">/</span>
            </div>
            <div>
              <span className="text-3xl">{result.totalMarks}</span>
              <span className="block text-xs text-[#738f93] uppercase">Total Possible</span>
            </div>
          </div>
        </div>

        {percentage >= 60 && (
          <div className="flex justify-center mb-8">
            <Link to={`/certificate/${id}`} className="bg-[var(--color-primary-green)] text-white font-bold py-3 px-8 rounded shadow hover:bg-[var(--color-primary-green-dark)] transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
              View Certificate
            </Link>
          </div>
        )}

        {/* Detailed Answers (Optional MVP feature) */}
        <div className="bg-white rounded border border-[var(--color-hr-border)] shadow-sm">
          <div className="bg-[#f9fbfb] p-4 border-b border-[var(--color-hr-border)]">
            <h3 className="font-bold text-[#39424e]">Question Analysis</h3>
          </div>
          <div className="divide-y divide-[var(--color-hr-border)]">
            {result.answers?.map((ans, idx) => (
              <div key={ans.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {ans.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-[#39424e] mb-2">Q{idx + 1}. {ans.questionText}</p>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-semibold text-[#738f93]">Your Answer: </span> 
                        <span className={ans.isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                          Option {ans.selectedAnswer || 'Not Attempted'}
                        </span>
                      </p>
                      {!ans.isCorrect && (
                        <p>
                          <span className="font-semibold text-[#738f93]">Correct Answer: </span> 
                          <span className="text-green-600 font-bold">Option {ans.actualCorrectAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-[#f3f7f7] border border-[var(--color-hr-border)] rounded text-xs font-bold text-[#39424e]">
                      {ans.marksAwarded} Marks
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
