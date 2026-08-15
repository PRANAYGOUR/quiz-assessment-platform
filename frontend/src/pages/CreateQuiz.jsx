import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    negativeMarking: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/quizzes', formData);
      if (res.data.success) {
        // Redirect directly to question management for the new quiz
        navigate(`/admin/manage-questions/${res.data.quiz.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-[#738f93] hover:text-[#39424e] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        
        <div className="bg-white shadow-sm border border-[var(--color-hr-border)] rounded-md overflow-hidden">
          <div className="bg-[#f9fbfb] px-8 py-5 border-b border-[var(--color-hr-border)]">
            <h2 className="text-xl font-bold text-[#39424e]">Create New Assessment</h2>
            <p className="text-sm text-[#738f93] mt-1">Define the core settings for your technical quiz.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded text-sm font-medium border border-red-200">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-[#39424e] mb-1">Assessment Title</label>
              <input
                type="text"
                name="title"
                required
                className="input-field"
                placeholder="e.g., React JS Core Concepts"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#39424e] mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                className="input-field"
                placeholder="Instructions or summary for the students..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#39424e] mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  required
                  min="1"
                  className="input-field"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  name="negativeMarking"
                  id="negativeMarking"
                  className="h-4 w-4 text-[var(--color-primary-green)] focus:ring-[var(--color-primary-green)] border-[var(--color-hr-border)] rounded"
                  checked={formData.negativeMarking}
                  onChange={handleChange}
                />
                <label htmlFor="negativeMarking" className="ml-2 block text-sm font-semibold text-[#39424e]">
                  Enable Negative Marking
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--color-hr-border)] flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary w-auto px-8">
                {loading ? 'Saving...' : (
                  <><Plus className="w-5 h-5" /> Save & Add Questions</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
