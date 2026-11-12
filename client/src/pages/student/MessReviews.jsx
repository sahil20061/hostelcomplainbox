import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageLoader } from '../../components/Spinner';
import api from '../../utils/api';

function Stars({ value, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'text-2xl' : 'text-base';
  return (
    <span className={`${sizeClass} inline-flex gap-0.5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(value) ? '' : 'opacity-20 grayscale'}>⭐</span>
      ))}
    </span>
  );
}

export default function MessReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reviewsData, statsData] = await Promise.all([
        api.get('/mess/reviews').catch(() => ({ reviews: [] })),
        api.get('/mess/reviews/stats').catch(() => null),
      ]);
      const rList = reviewsData.data?.reviews || reviewsData.reviews || reviewsData.data || (Array.isArray(reviewsData) ? reviewsData : []);
      setReviews(rList);
      setStats(statsData?.data || statsData);
    } catch {
      // handled above
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  const overallAvg = stats?.overallAverage || stats?.overall || (reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0);

  const mealStats = stats?.byMealType || {};
  const mealTypes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  const mealIcons = { Breakfast: '🌅', Lunch: '☀️', Snacks: '🍪', Dinner: '🌙' };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mess Reviews</h1>
          <p className="text-gray-500 mt-1">Food quality ratings and feedback</p>
        </div>
        <Link to="/student/mess-reviews/new" className="btn-primary inline-flex items-center gap-2 text-sm self-start">
          ⭐ Write Review
        </Link>
      </div>

      {/* Overall Rating */}
      <div className="card mb-6 text-center">
        <p className="text-sm font-medium text-gray-500 mb-2">Overall Rating</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-bold text-gray-900">{Number(overallAvg).toFixed(1)}</span>
          <Stars value={Number(overallAvg)} size="lg" />
        </div>
        <p className="text-sm text-gray-400 mt-1">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Per-Meal Ratings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {mealTypes.map((meal) => {
          const mealReviews = reviews.filter((r) => (r.meal_type || r.mealType) === meal);
          const statItem = Array.isArray(stats?.overall) ? stats.overall.find((s) => s.meal_type === meal) : null;
          const avg = statItem?.avg_rating || mealStats[meal]?.average || (mealReviews.length > 0
            ? (mealReviews.reduce((s, r) => s + r.rating, 0) / mealReviews.length).toFixed(1)
            : '-');
          return (
            <div key={meal} className="card text-center py-4">
              <span className="text-2xl">{mealIcons[meal]}</span>
              <p className="text-sm font-medium text-gray-700 mt-1">{meal}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{avg === '-' ? '-' : Number(avg).toFixed(1)}</p>
              <Stars value={Number(avg) || 0} />
            </div>
          );
        })}
      </div>

      {/* Recent Reviews */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-gray-500">No reviews yet</p>
            <Link to="/student/mess-reviews/new" className="text-primary-600 text-sm font-medium mt-1 inline-block">
              Write the first review →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              const mType = review.meal_type || review.mealType;
              return (
                <div key={review.id || review._id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{mealIcons[mType] || '🍽️'}</span>
                      <span className="text-sm font-semibold text-gray-900">{mType}</span>
                    </div>
                    <Stars value={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.date || review.created_at || review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
