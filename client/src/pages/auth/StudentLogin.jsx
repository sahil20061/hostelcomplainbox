import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast, ToastContainer } from '../../components/Toast';

export default function StudentLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  if (isAuthenticated) {
    navigate('/student/dashboard', { replace: true });
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
      await login('/auth/student/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      success('Login successful!');
      setTimeout(() => navigate('/student/dashboard'), 300);
    } catch (err) {
      error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium mb-4">
            ← Back to Home
          </Link>
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            🎓
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Login</h1>
          <p className="text-gray-500 mt-1">Shaheed Bhagat Singh Hostel</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="label-text">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="label-text">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="input-field"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          <div className="space-y-2 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/student/signup" className="text-primary-600 font-semibold hover:text-primary-700">
                Sign up
              </Link>
            </p>
            <p className="text-gray-500">
              Are you a warden?{' '}
              <Link to="/warden/login" className="text-primary-600 font-medium hover:text-primary-700">
                Warden Login →
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
