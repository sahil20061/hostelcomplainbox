import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast, ToastContainer } from '../../components/Toast';
import api from '../../utils/api';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

function StarRating({ value, onChange, size = 'lg' }) {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'lg' ? 'text-4xl' : 'text-2xl';

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`${sizeClass} transition-transform duration-150 hover:scale-110 ${
            star <= (hover || value)
              ? 'drop-shadow-sm'
              : 'opacity-30 grayscale'
          }`}
        >
          ⭐
        </button>
      ))}
    </div>
  );
}

export default function NewMessReview() {
  const navigate = useNavigate();
  const { toasts, success, error, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    mealType: '',
    rating: 0,
    comment: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.mealType) {
      error('Please select a meal type');
      return;
    }
    if (!form.rating) {
      error('Please select a rating');
      return;
    }
    setLoading(true);
    try {
      await api.post('/mess/reviews', {
        mealType: form.mealType,
        rating: form.rating,
        comment: form.comment.trim(),
        date: form.date,
      });
      success('Review submitted successfully!');
      setTimeout(() => navigate('/student/mess-reviews'), 800);
    } catch (err) {
      error(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Review Mess Food</h1>
        <p className="text-gray-500 mt-1">Share your feedback about today's meals</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Meal Type */}
        <div>
          <label className="label-text">Meal Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            {MEAL_TYPES.map((meal) => {
              const mealIcons = { Breakfast: '🌅', Lunch: '☀️', Snacks: '🍪', Dinner: '🌙' };
              return (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, mealType: meal }))}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    form.mealType === meal
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{mealIcons[meal]}</span>
                  <span className={`text-xs font-medium ${form.mealType === meal ? 'text-primary-700' : 'text-gray-600'}`}>
                    {meal}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="label-text">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            className="input-field"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Rating */}
        <div>
          <label className="label-text">Rating</label>
          <div className="flex flex-col items-center gap-2 py-4 bg-gray-50 rounded-xl">
            <StarRating value={form.rating} onChange={(r) => setForm((prev) => ({ ...prev, rating: r }))} />
            {form.rating > 0 && (
              <p className={`text-sm font-medium ${
                form.rating <= 2 ? 'text-red-600' : form.rating === 3 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {ratingLabels[form.rating]}
              </p>
            )}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="label-text">Comment (optional)</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
            placeholder="Share your thoughts about the food quality, taste, hygiene..."
            rows={3}
            className="input-field resize-none"
            maxLength={300}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.comment.length}/300</p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              '⭐ Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
