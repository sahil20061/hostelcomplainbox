import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';

export default function ViewMessReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchStats = async () => {
    try {
      const res = await api.get('/mess/reviews/stats');
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let query = `?page=${page}&limit=15`;
      if (selectedDate) query += `&date=${selectedDate}`;

      const res = await api.get(`/mess/reviews${query}`);
      if (res.success) {
        setReviews(res.data.reviews);
        setTotalPages(res.data.pagination.totalPages);
        setTotalReviews(res.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [page, selectedDate]);

  const renderStars = (rating) => {
    return (
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-amber-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hostel Mess Reviews & Food Quality</h1>
        <p className="text-gray-600 mt-1">
          Monitor student ratings and feedback on Breakfast, Lunch, Snacks, and Dinner
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {/* Overall card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Overall Rating
          </span>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-gray-900">
              {stats?.overallAverage || '0.0'}
            </span>
            <span className="text-sm text-gray-400"> / 5</span>
          </div>
          <span className="text-xs text-gray-500">{stats?.totalReviews || 0} reviews</span>
        </div>

        {/* Meal Cards */}
        {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => {
          const item = stats?.overall?.find((s) => s.meal_type === meal);
          const icon =
            meal === 'Breakfast' ? '🥞' : meal === 'Lunch' ? '🍛' : meal === 'Snacks' ? '☕' : '🍲';
          return (
            <div key={meal} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {meal}
                </span>
                <span className="text-base">{icon}</span>
              </div>
              <div className="my-2">
                <span className="text-2xl font-bold text-gray-900">
                  {item?.avg_rating || 'N/A'}
                </span>
                {item?.avg_rating && <span className="text-xs text-gray-400"> / 5</span>}
              </div>
              <span className="text-xs text-gray-500">{item?.total_reviews || 0} reviews</span>
            </div>
          );
        })}
      </div>

      {/* Filter by Date */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filter by Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {selectedDate && (
            <button
              onClick={() => {
                setSelectedDate('');
                setPage(1);
              }}
              className="text-xs text-primary-600 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        <span className="text-xs text-gray-500">
          Showing {reviews.length} of {totalReviews} reviews
        </span>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
          <span className="text-4xl">🍽️</span>
          <h3 className="text-lg font-bold text-gray-800 mt-2">No Reviews Found</h3>
          <p className="text-gray-500 text-sm mt-1">
            {selectedDate
              ? 'No reviews logged for this specific date.'
              : 'Students haven’t submitted any mess food feedback yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
                    {rev.meal_type}
                  </span>
                  <span className="text-xs font-medium text-gray-400">•</span>
                  <span className="text-xs font-medium text-gray-500">{rev.date}</span>
                  <span className="text-xs font-medium text-gray-400">•</span>
                  <span className="text-xs font-semibold text-gray-700">
                    Room {rev.room_no} ({rev.student_name})
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {renderStars(rev.rating)}
                  <span className="text-xs font-bold text-gray-800">{rev.rating}/5</span>
                </div>

                {rev.comment && (
                  <p className="text-sm text-gray-700 pt-1 italic">
                    "{rev.comment}"
                  </p>
                )}
              </div>

              <div className="text-xs text-gray-400 self-start md:self-center">
                Logged: {new Date(rev.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-gray-600 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
