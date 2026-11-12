import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';

export default function WardenDashboard() {
  const [complaintStats, setComplaintStats] = useState(null);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [messStats, setMessStats] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [cStatsRes, bSumRes, mStatsRes, sStatsRes, cListRes] = await Promise.all([
          api.get('/complaints/stats').catch(() => ({ success: false })),
          api.get('/budget/summary').catch(() => ({ success: false })),
          api.get('/mess/reviews/stats').catch(() => ({ success: false })),
          api.get('/students/stats').catch(() => ({ success: false })),
          api.get('/complaints?status=Pending').catch(() => ({ success: false })),
        ]);

        if (cStatsRes.success) setComplaintStats(cStatsRes.data);
        if (bSumRes.success) setBudgetSummary(bSumRes.data);
        if (mStatsRes.success) setMessStats(mStatsRes.data);
        if (sStatsRes.success) setStudentStats(sStatsRes.data);
        if (cListRes.success) setRecentComplaints(cListRes.data.slice(0, 5));
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const pendingCount = complaintStats?.byStatus?.find((s) => s.status === 'Pending')?.count || 0;
  const inProgressCount = complaintStats?.byStatus?.find((s) => s.status === 'In Progress')?.count || 0;
  const resolvedCount = complaintStats?.byStatus?.find((s) => s.status === 'Resolved')?.count || 0;

  const totalAllocated = budgetSummary?.totals?.allocated || 0;
  const totalSpent = budgetSummary?.totals?.spent || 0;
  const remainingBudget = budgetSummary?.totals?.remaining || 0;
  const budgetSpentPct = totalAllocated > 0 ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Warden Administration Portal</h1>
            <p className="text-gray-600 mt-1">
              Shaheed Bhagat Singh Hostel • NIT Kurukshetra (500 Room Capacity)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/warden/budget"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
            >
              💰 Manage Budget
            </Link>
            <Link
              to="/warden/complaints"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
            >
              📋 Review Complaints
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Main KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">Students Enrolled</span>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg text-xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {studentStats?.totalRegistered || 0}
              <span className="text-sm font-normal text-gray-400"> / 500</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Occupancy: <strong className="text-blue-600">{studentStats?.occupancyRate || 0}%</strong> of capacity
          </p>
        </div>

        {/* Complaints Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">Pending Complaints</span>
              <span className="p-2 bg-amber-50 text-amber-600 rounded-lg text-xl">⚠️</span>
            </div>
            <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {inProgressCount} in progress • {resolvedCount} resolved
          </p>
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">Budget Allocated</span>
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-xl">₹</span>
            </div>
            <div className="text-3xl font-bold text-emerald-700">
              ₹{totalAllocated.toLocaleString()}
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${budgetSpentPct}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ₹{totalSpent.toLocaleString()} spent ({budgetSpentPct}%)
            </p>
          </div>
        </div>

        {/* Mess Rating */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">Mess Food Rating</span>
              <span className="p-2 bg-yellow-50 text-yellow-600 rounded-lg text-xl">⭐</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {messStats?.overallAverage ? messStats.overallAverage : 'N/A'}
              {messStats?.overallAverage && <span className="text-sm font-normal text-gray-400"> / 5</span>}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Based on {messStats?.totalReviews || 0} student reviews
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Pending Complaints & Budget Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          {/* Urgent Complaints List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>⚡</span> Urgent Pending Complaints
              </h2>
              <Link
                to="/warden/complaints"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all ({pendingCount}) →
              </Link>
            </div>

            {recentComplaints.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                🎉 No pending complaints! All reported hostel issues are resolved or in progress.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentComplaints.map((c) => (
                  <div key={c.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800">
                          Room {c.room_no}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{c.category}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{c.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        By {c.student_name} • {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to="/warden/complaints"
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors whitespace-nowrap"
                    >
                      Action
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budget Allocation Summary by Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>📊</span> Hostel Budget Allocation & Expense
              </h2>
              <Link
                to="/warden/budget"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Manage Budget →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 block">Total Allocated</span>
                <span className="text-lg font-bold text-gray-900">₹{totalAllocated.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 block">Total Spent</span>
                <span className="text-lg font-bold text-red-600">₹{totalSpent.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 block">Remaining Balance</span>
                <span className="text-lg font-bold text-emerald-600">₹{remainingBudget.toLocaleString()}</span>
              </div>
            </div>

            {budgetSummary?.byCategory && budgetSummary.byCategory.length > 0 ? (
              <div className="space-y-3">
                {budgetSummary.byCategory.map((cat) => {
                  const spent = cat.total_spent || 0;
                  const alloc = cat.total_allocated || 1;
                  const pct = Math.min(100, Math.round((spent / alloc) * 100));
                  return (
                    <div key={cat.category} className="text-sm">
                      <div className="flex justify-between font-medium text-gray-700 mb-1">
                        <span>{cat.category}</span>
                        <span>
                          ₹{spent.toLocaleString()} / ₹{alloc.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-2">No budget entries created yet.</p>
            )}
          </div>
        </div>

        {/* Right Col: Mess Ratings by Meal & Quick Navigation */}
        <div className="space-y-8">
          {/* Mess Feedback Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🍽️</span> Mess Ratings
              </h2>
              <Link
                to="/warden/mess-reviews"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                All reviews →
              </Link>
            </div>

            <div className="space-y-3">
              {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => {
                const item = messStats?.overall?.find((m) => m.meal_type === meal);
                const rating = item?.avg_rating || 0;
                return (
                  <div key={meal} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">{meal}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500">★</span>
                      <span className="text-sm font-bold text-gray-900">
                        {rating ? rating : '-'}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({item?.total_reviews || 0})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Warden Tools */}
          <div className="bg-gradient-to-br from-primary-800 to-primary-900 text-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-2">Hostel Administration</h3>
            <p className="text-primary-200 text-xs mb-4">
              Manage all hostel complaints (Fan, Windows, Pest/Mouse, Plumbing, Electrical), allocate and pass maintenance budget, and review student feedback.
            </p>
            <div className="space-y-2">
              <Link
                to="/warden/payments"
                className="block text-center w-full py-2 bg-emerald-500/30 hover:bg-emerald-500/50 rounded-lg text-sm font-semibold transition-colors"
              >
                💳 Track Student Fee Collections
              </Link>
              <Link
                to="/warden/mess-menu"
                className="block text-center w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                🍲 Edit Mess Menu (Agle Din Ka Khana)
              </Link>
              <Link
                to="/warden/complaints"
                className="block text-center w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                Resolve Student Complaints
              </Link>
              <Link
                to="/warden/budget"
                className="block text-center w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                Pass Maintenance Budget
              </Link>
              <Link
                to="/warden/students"
                className="block text-center w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                500-Room Student Directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
