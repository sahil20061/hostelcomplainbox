import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast, ToastContainer } from '../../components/Toast';

export default function WardenLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isWarden } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  if (isAuthenticated && isWarden) {
    navigate('/warden/dashboard', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login('/auth/warden/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      success('Login successful!');
      setTimeout(() => navigate('/warden/dashboard'), 300);
    } catch (err) {
      error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 text-sm font-medium mb-4">
            ← Back to Home
          </Link>
          <div className="w-16 h-16 bg-primary-900/50 border border-primary-700/50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            🛡️
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Warden Login</h1>
          <p className="text-gray-400 mt-1">Shaheed Bhagat Singh Hostel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6 space-y-5">
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-3 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-amber-400 text-lg flex-shrink-0">⚠️</span>
              <p className="text-amber-200 text-sm">Authorized Personnel Only. Restricted to hostel administration.</p>
            </div>
            <div className="text-xs text-amber-300/80 pt-1 border-t border-amber-800/40">
              Demo Credentials: <span className="font-mono text-white">warden@nitkkr.ac.in</span> / <span className="font-mono text-white">warden123</span>
              <button
                type="button"
                onClick={() => setForm({ email: 'warden@nitkkr.ac.in', password: 'warden123' })}
                className="ml-2 underline text-primary-300 hover:text-primary-200 cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="warden@nitkkr.ac.in"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Authenticating...
              </>
            ) : (
              '🔐 Secure Login'
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Student?{' '}
            <Link to="/student/login" className="text-primary-400 font-medium hover:text-primary-300">
              Student Login →
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
