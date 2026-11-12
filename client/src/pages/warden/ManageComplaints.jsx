import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';
import { useToast, ToastContainer } from '../../components/Toast';

const CATEGORIES = ['All', 'Fan', 'Window', 'Electrical', 'Plumbing', 'Pest/Mouse', 'Furniture', 'Other'];
const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

const CATEGORY_ICONS = {
  Fan: '🪭',
  Window: '🪟',
  Electrical: '⚡',
  Plumbing: '🔧',
  'Pest/Mouse': '🐭',
  Furniture: '🪑',
  Other: '📋',
};

const STATUS_BADGES = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
};

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [roomSearch, setRoomSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [wardenRemarks, setWardenRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const { toasts, success, error, removeToast } = useToast();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      let query = [];
      if (filterCategory !== 'All') query.push(`category=${encodeURIComponent(filterCategory)}`);
      if (filterStatus !== 'All') query.push(`status=${encodeURIComponent(filterStatus)}`);
      if (roomSearch.trim()) query.push(`room_no=${encodeURIComponent(roomSearch.trim())}`);

      const queryString = query.length > 0 ? `?${query.join('&')}` : '';
      const res = await api.get(`/complaints${queryString}`);
      if (res.success) {
        setComplaints(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filterCategory, filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const openActionModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateStatus(complaint.status);
    setWardenRemarks(complaint.warden_remarks || '');
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setUpdating(true);
      const res = await api.patch(`/complaints/${selectedComplaint.id}`, {
        status: updateStatus,
        warden_remarks: wardenRemarks,
      });

      if (res.success) {
        success(`Complaint #${selectedComplaint.id} updated to "${updateStatus}"`);
        setComplaints((prev) =>
          prev.map((c) => (c.id === selectedComplaint.id ? res.data : c))
        );
        setSelectedComplaint(null);
      }
    } catch (err) {
      error(err.message || 'Failed to update complaint');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Hostel Complaints</h1>
        <p className="text-gray-600 mt-1">
          Review, assign, and resolve maintenance issues reported by students of SBS Hostel
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : `${CATEGORY_ICONS[cat] || ''} ${cat}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Room Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-end gap-2 w-full md:w-auto">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Room No. (1-500)</label>
            <input
              type="number"
              placeholder="e.g. 104"
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-36"
              min="1"
              max="500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Search
          </button>
          {roomSearch && (
            <button
              type="button"
              onClick={() => {
                setRoomSearch('');
                setTimeout(fetchComplaints, 0);
              }}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Complaints List / Table */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
          <span className="text-4xl">🎉</span>
          <h3 className="text-lg font-bold text-gray-800 mt-3">No Complaints Found</h3>
          <p className="text-gray-500 text-sm mt-1">
            No complaints match the chosen filters or room number.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs">
                <tr>
                  <th className="px-6 py-3">ID & Date</th>
                  <th className="px-6 py-3">Room & Student</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">#{c.id}</span>
                      <p className="text-xs text-gray-400">
                        {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded bg-primary-100 text-primary-800 font-bold text-xs mb-1">
                        Room {c.room_no}
                      </span>
                      <p className="text-xs font-medium text-gray-900">{c.student_name}</p>
                      <p className="text-xs text-gray-400">{c.student_email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <span>{CATEGORY_ICONS[c.category] || '📋'}</span>
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="truncate text-gray-800 font-medium">{c.description}</p>
                      {c.warden_remarks && (
                        <p className="text-xs text-primary-600 mt-1 italic">
                          Warden: "{c.warden_remarks}"
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          STATUS_BADGES[c.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => openActionModal(c)}
                        className="px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Update / Action
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for updating complaint */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Update Complaint #{selectedComplaint.id}
              </h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="my-4 space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-500">Student:</span>
                <span className="font-semibold text-gray-900">
                  {selectedComplaint.student_name} (Room {selectedComplaint.room_no})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-semibold text-gray-900">
                  {CATEGORY_ICONS[selectedComplaint.category]} {selectedComplaint.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date Filed:</span>
                <span className="text-gray-700">
                  {new Date(selectedComplaint.created_at).toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-500 block mb-1">Issue Details:</span>
                <p className="text-gray-800 bg-white p-2.5 rounded border border-gray-200 text-xs">
                  {selectedComplaint.description}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Change Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Warden Remarks / Action Taken
                </label>
                <textarea
                  rows="3"
                  value={wardenRemarks}
                  onChange={(e) => setWardenRemarks(e.target.value)}
                  placeholder="e.g. Electrician visited and repaired the fan regulator on 13th Nov."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
