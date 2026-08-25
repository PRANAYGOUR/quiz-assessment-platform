import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Code2 } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await login(email, password);
      if (user) {
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login.');
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
            Log in to Platform
          </h2>
          <p className="mt-2 text-sm text-[#738f93]">
            Prepare for your technical assessment
          </p>
          <div className="mt-4 inline-block bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
            ℹ️ Students and Admins can both log in here
          </div>
        </div>
        
        <div className="bg-white py-8 px-10 shadow-sm border border-[var(--color-hr-border)] rounded-md">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-[#39424e] mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-[#39424e]">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-[var(--color-primary-green)] hover:underline">
                  Forgot your password?
                </a>
              </div>
              <input
                type="password"
                required
                className="input-field font-mono"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Authenticating...' : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Log In
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-[var(--color-hr-border)] pt-6 text-center">
            <p className="text-sm text-[#738f93]">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[var(--color-primary-green)] hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
