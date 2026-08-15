import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, HelpCircle } from 'lucide-react';

export default function ManageQuestions() {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    marks: 1
  });

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const fetchQuestions = async () => {
    try {
      const res = await api.get(`/quizzes/${id}/questions`);
      if (res.data.success) setQuestions(res.data.questions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/quizzes/${id}/questions`, newQuestion);
      if (res.data.success) {
        setNewQuestion({
          questionText: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctAnswer: 'A',
          marks: 1
        });
        fetchQuestions(); // refresh list
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add question');
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-[#738f93] hover:text-[#39424e] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Question Form */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm border border-[var(--color-hr-border)] rounded-md">
              <div className="bg-[#f9fbfb] px-6 py-4 border-b border-[var(--color-hr-border)]">
                <h3 className="font-bold text-[#39424e] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[var(--color-primary-green)]" /> Add Question
                </h3>
              </div>
              <form onSubmit={handleAddQuestion} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#39424e] mb-1">Question Text</label>
                  <textarea required name="questionText" rows={3} className="input-field text-sm" value={newQuestion.questionText} onChange={handleInputChange} />
                </div>
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div key={opt}>
                    <label className="block text-xs font-bold text-[#39424e] mb-1">Option {opt}</label>
                    <input required type="text" name={`option${opt}`} className="input-field text-sm" value={newQuestion[`option${opt}`]} onChange={handleInputChange} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#39424e] mb-1">Correct</label>
                    <select name="correctAnswer" className="input-field text-sm bg-white" value={newQuestion.correctAnswer} onChange={handleInputChange}>
                      {['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt}>Option {opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#39424e] mb-1">Marks</label>
                    <input type="number" required min="1" name="marks" className="input-field text-sm" value={newQuestion.marks} onChange={handleInputChange} />
                  </div>
                </div>
                <button type="submit" className="btn-primary mt-4 text-sm py-2">
                  <Save className="w-4 h-4" /> Save Question
                </button>
              </form>
            </div>
          </div>

          {/* Question List */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-[#39424e] mb-4">Current Questions ({questions.length})</h3>
            {loading ? (
              <div className="text-[#738f93]">Loading...</div>
            ) : questions.length === 0 ? (
              <div className="bg-white p-8 text-center rounded border border-[var(--color-hr-border)] text-[#738f93]">
                No questions added yet.
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white p-6 rounded border border-[var(--color-hr-border)] shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-[#39424e] text-lg">Q{idx + 1}. {q.questionText}</h4>
                      <span className="bg-[#f3f7f7] text-[#39424e] text-xs font-bold px-2 py-1 rounded border border-[var(--color-hr-border)]">
                        {q.marks} Marks
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <div key={opt} className={`p-3 rounded border ${q.correctAnswer === opt ? 'border-[var(--color-primary-green)] bg-[#f2faf4] text-[#209939] font-bold' : 'border-[var(--color-hr-border)] text-[#738f93]'}`}>
                          <span className="mr-2 opacity-70">{opt}.</span> {q[`option${opt}`]}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
