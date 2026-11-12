import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/Spinner';
import api from '../../utils/api';

const CATEGORY_ICONS = {
  Fan: '🪭',
  Window: '🪟',
  Electrical: '⚡',
  Plumbing: '🔧',
  'Pest/Mouse': '🐭',
  Furniture: '🪑',
  Other: '📋',
};

const STATUS_STYLES = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  Resolved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints/my');
      const list = res.data || res.complaints || (Array.isArray(res) ? res : []);
      setComplaints(list);
      setStats({
        total: list.length,
        pending: list.filter((c) => c.status === 'Pending' || c.status === 'In Progress').length,
        resolved: list.filter((c) => c.status === 'Resolved').length,
      });
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  const recentComplaints = complaints.slice(0, 5);

  const statCards = [
    { label: 'Total Complaints', value: stats.total, icon: '📋', color: 'bg-primary-50 text-primary-700 border-primary-100' },
    { label: 'Pending', value: stats.pending, icon: '⏳', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
    { label: 'Resolved', value: stats.resolved, icon: '✅', color: 'bg-green-50 text-green-700 border-green-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Room {user?.room_no || user?.roomNumber} • Shaheed Bhagat Singh Hostel
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className={`rounded-xl p-5 border ${stat.color} transition-shadow hover:shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          to="/student/payments"
          className="card flex items-center gap-4 group hover:border-emerald-300 hover:bg-emerald-50/40"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-xl group-hover:bg-emerald-200 transition-colors">
            💳
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Pay Fees Online</h3>
            <p className="text-xs text-gray-500">Mess bill, room & dues</p>
          </div>
        </Link>

        <Link
          to="/student/mess-menu"
          className="card flex items-center gap-4 group hover:border-indigo-300 hover:bg-indigo-50/40"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-xl group-hover:bg-indigo-200 transition-colors">
            🍲
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Agle Din Ka Khana</h3>
            <p className="text-xs text-gray-500">Tomorrow's mess menu</p>
          </div>
        </Link>

        <Link
          to="/student/complaints/new"
          className="card flex items-center gap-4 group hover:border-primary-200 hover:bg-primary-50/50"
        >
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-xl group-hover:bg-primary-200 transition-colors">
            ➕
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">New Complaint</h3>
            <p className="text-xs text-gray-500">Fan, window, pest, etc.</p>
          </div>
        </Link>

        <Link
          to="/student/mess-reviews/new"
          className="card flex items-center gap-4 group hover:border-amber-200 hover:bg-amber-50/50"
        >
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-xl group-hover:bg-amber-200 transition-colors">
            ⭐
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Review Mess Food</h3>
            <p className="text-xs text-gray-500">Rate daily quality</p>
          </div>
        </Link>
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
          <Link to="/student/complaints" className="text-primary-600 text-sm font-medium hover:text-primary-700">
            View All →
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-4xl mb-2">📭</p>
            <p className="text-gray-500">No complaints yet</p>
            <Link to="/student/complaints/new" className="text-primary-600 text-sm font-medium mt-1 inline-block hover:text-primary-700">
              File your first complaint →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentComplaints.map((complaint) => (
              <div key={complaint.id || complaint._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="text-xl flex-shrink-0">
                  {CATEGORY_ICONS[complaint.category] || '📋'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{complaint.description}</p>
                  <p className="text-xs text-gray-500">
                    {complaint.category} • {new Date(complaint.created_at || complaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[complaint.status] || STATUS_STYLES.Pending}`}>
                  {complaint.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
