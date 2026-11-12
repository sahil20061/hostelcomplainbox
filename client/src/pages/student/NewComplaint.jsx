import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast, ToastContainer } from '../../components/Toast';
import api from '../../utils/api';

const CATEGORIES = [
  { value: 'Fan', icon: '🪭', label: 'Fan' },
  { value: 'Window', icon: '🪟', label: 'Window' },
  { value: 'Electrical', icon: '⚡', label: 'Electrical' },
  { value: 'Plumbing', icon: '🔧', label: 'Plumbing' },
  { value: 'Pest/Mouse', icon: '🐭', label: 'Pest / Mouse' },
  { value: 'Furniture', icon: '🪑', label: 'Furniture' },
  { value: 'Other', icon: '📋', label: 'Other' },
];

export default function NewComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toasts, success, error, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: '',
    description: '',
    roomNumber: user?.roomNumber || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      error('Please select a category');
      return;
    }
    if (!form.description.trim()) {
      error('Please describe your complaint');
      return;
    }
    if (form.description.trim().length < 10) {
      error('Description must be at least 10 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/complaints', {
        category: form.category,
        description: form.description.trim(),
        roomNumber: parseInt(form.roomNumber),
      });
      success('Complaint submitted successfully!');
      setTimeout(() => navigate('/student/complaints'), 800);
    } catch (err) {
      error(err.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">New Complaint</h1>
        <p className="text-gray-500 mt-1">Report a hostel issue and we'll get it fixed</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Category Selection */}
        <div>
          <label className="label-text">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, category: cat.value }))}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                  form.category === cat.value
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-xs font-medium ${form.category === cat.value ? 'text-primary-700' : 'text-gray-600'}`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Room Number */}
        <div>
          <label className="label-text">Room Number</label>
          <input
            type="number"
            value={form.roomNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, roomNumber: e.target.value }))}
            className="input-field bg-gray-50"
            min={1}
            max={500}
            readOnly={!!user?.roomNumber}
          />
          {user?.roomNumber && (
            <p className="text-xs text-gray-400 mt-1">Auto-filled from your profile</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="label-text">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the issue in detail... (e.g., 'Ceiling fan in room not working since yesterday, making grinding noise')"
            rows={4}
            className="input-field resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {form.description.length}/500
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              '📨 Submit Complaint'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
