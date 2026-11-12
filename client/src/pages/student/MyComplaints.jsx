import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints/my');
      const list = res.data || res.complaints || (Array.isArray(res) ? res : []);
      setComplaints(list);
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  const filtered = filter === 'All' ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-gray-500 mt-1">{complaints.length} total complaint{complaints.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/student/complaints/new" className="btn-primary inline-flex items-center gap-2 text-sm self-start">
          ➕ New Complaint
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === status
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status}
            {status !== 'All' && (
              <span className="ml-1.5 opacity-70">
                ({complaints.filter((c) => c.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 font-medium">No complaints found</p>
          {filter !== 'All' && (
            <button onClick={() => setFilter('All')} className="text-primary-600 text-sm font-medium mt-2">
              Show all complaints
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((complaint) => {
            const remarks = complaint.warden_remarks || complaint.remarks;
            return (
              <div key={complaint.id || complaint._id} className="card hover:border-primary-100">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">
                    {CATEGORY_ICONS[complaint.category] || '📋'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <span className="text-sm font-semibold text-gray-900">{complaint.category}</span>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-sm text-gray-500">Room {complaint.room_no || complaint.roomNumber}</span>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_STYLES[complaint.status] || STATUS_STYLES.Pending}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{complaint.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>📅 {new Date(complaint.created_at || complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {complaint.updated_at && (
                        <span>🔄 Updated {new Date(complaint.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                    </div>
                    {remarks && (
                      <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-0.5">Warden's Remarks:</p>
                        <p className="text-sm text-blue-800">{remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
