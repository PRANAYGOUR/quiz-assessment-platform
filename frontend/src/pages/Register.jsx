import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Code2 } from 'lucide-react';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await register(formData.name, formData.email, formData.password, formData.role);
      if (user) {
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Code2 className="mx-auto h-12 w-12 text-[var(--color-primary-green)]" />
          <h2 className="mt-6 text-3xl font-extrabold text-[#39424e]">
            Sign up
          </h2>
          <p className="mt-2 text-sm text-[#738f93]">
            Join the developer community
          </p>
        </div>
        
        <div className="bg-white py-8 px-10 shadow-sm border border-[var(--color-hr-border)] rounded-md">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-[#39424e] mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="input-field"
                placeholder="Jane Developer"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#39424e] mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="input-field"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#39424e] mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="input-field font-mono"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#39424e] mb-1">
                I am a...
              </label>
              <select
                name="role"
                className="input-field bg-white"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student (Take quizzes)</option>
                <option value="admin">Admin (Create quizzes)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Creating account...' : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-[var(--color-hr-border)] pt-6 text-center">
            <p className="text-sm text-[#738f93]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[var(--color-primary-green)] hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
