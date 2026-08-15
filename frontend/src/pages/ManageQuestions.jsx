import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, HelpCircle, Edit2, Trash2, Clock } from 'lucide-react';

export default function ManageQuestions() {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    marks: 1,
    timeLimit: 0
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

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/quizzes/questions/${editingId}`, newQuestion);
      } else {
        await api.post(`/quizzes/${id}/questions`, newQuestion);
      }
      
      setNewQuestion({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        marks: 1,
        timeLimit: 0
      });
      setEditingId(null);
      fetchQuestions(); // refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save question');
    }
  };

  const handleEdit = (q) => {
    setEditingId(q.id);
    setNewQuestion({
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      timeLimit: q.timeLimit || 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (qId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await api.delete(`/quizzes/questions/${qId}`);
        fetchQuestions();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete question');
      }
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
            <div className="bg-white shadow-sm border border-[var(--color-hr-border)] rounded-md sticky top-6">
              <div className="bg-[#f9fbfb] px-6 py-4 border-b border-[var(--color-hr-border)] flex justify-between items-center">
                <h3 className="font-bold text-[#39424e] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[var(--color-primary-green)]" /> 
                  {editingId ? 'Edit Question' : 'Add Question'}
                </h3>
                {editingId && (
                  <button onClick={() => { setEditingId(null); setNewQuestion({questionText:'',optionA:'',optionB:'',optionC:'',optionD:'',correctAnswer:'A',marks:1,timeLimit:0})}} className="text-xs text-red-500 hover:underline">Cancel Edit</button>
                )}
              </div>
              <form onSubmit={handleSaveQuestion} className="p-6 space-y-4">
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
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#39424e] mb-1">Correct</label>
                    <select name="correctAnswer" className="input-field text-sm bg-white" value={newQuestion.correctAnswer} onChange={handleInputChange}>
                      {['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#39424e] mb-1">Marks</label>
                    <input type="number" required min="1" name="marks" className="input-field text-sm" value={newQuestion.marks} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#39424e] mb-1 text-nowrap">Time (sec)</label>
                    <input type="number" min="0" name="timeLimit" className="input-field text-sm" value={newQuestion.timeLimit} onChange={handleInputChange} placeholder="0 = None" title="0 means no limit" />
                  </div>
                </div>
                <button type="submit" className="btn-primary mt-4 text-sm py-2 w-full">
                  <Save className="w-4 h-4" /> {editingId ? 'Update Question' : 'Save Question'}
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
                      <div className="flex items-center gap-2">
                        {q.timeLimit > 0 && (
                          <span className="flex items-center gap-1 bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded border border-orange-200">
                            <Clock className="w-3 h-3" /> {q.timeLimit}s
                          </span>
                        )}
                        <span className="bg-[#f3f7f7] text-[#39424e] text-xs font-bold px-2 py-1 rounded border border-[var(--color-hr-border)]">
                          {q.marks} Marks
                        </span>
                        <button onClick={() => handleEdit(q)} className="text-[#738f93] hover:text-[#39424e] ml-2"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(q.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
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
