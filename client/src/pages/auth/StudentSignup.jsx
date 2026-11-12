import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast, ToastContainer } from '../../components/Toast';

export default function StudentSignup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    roomNumber: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.roomNumber) errs.roomNumber = 'Room number is required';
    else if (parseInt(form.roomNumber) < 1 || parseInt(form.roomNumber) > 500)
      errs.roomNumber = 'Room number must be between 1 and 500';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/[- ]/g, '')))
      errs.phone = 'Phone must be 10 digits';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup('/auth/student/signup', {
        name: form.name.trim(),
        roomNumber: parseInt(form.roomNumber),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      });
      success('Account created successfully!');
      setTimeout(() => navigate('/student/dashboard'), 500);
    } catch (err) {
      error(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputGroup = (label, name, type = 'text', placeholder = '', extra = null) => (
    <div>
      <label className="label-text">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`input-field ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''}`}
        {...(extra || {})}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium mb-4">
            ← Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Registration</h1>
          <p className="text-gray-500 mt-1">Shaheed Bhagat Singh Hostel, NIT Kurukshetra</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {inputGroup('Full Name', 'name', 'text', 'Enter your full name')}

          <div className="grid grid-cols-2 gap-4">
            {inputGroup('Room Number', 'roomNumber', 'number', '1-500', { min: 1, max: 500 })}
            {inputGroup('Phone Number', 'phone', 'tel', '10-digit number')}
          </div>

          {inputGroup('Email Address', 'email', 'email', 'your.email@example.com')}

          <div className="grid grid-cols-2 gap-4">
            {inputGroup('Password', 'password', 'password', 'Min 6 characters')}
            {inputGroup('Confirm Password', 'confirmPassword', 'password', 'Re-enter password')}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              '🎓 Create Account'
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/student/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
