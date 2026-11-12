import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';

export default function WardenPayments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [roomSearch, setRoomSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let query = [];
      if (filterType !== 'All') query.push(`payment_type=${encodeURIComponent(filterType)}`);
      if (roomSearch.trim()) query.push(`room_no=${encodeURIComponent(roomSearch.trim())}`);

      const qString = query.length > 0 ? `?${query.join('&')}` : '';
      const [listRes, statsRes] = await Promise.all([
        api.get(`/payments${qString}`).catch(() => ({ success: false })),
        api.get('/payments/stats').catch(() => ({ success: false })),
      ]);

      if (listRes.success) setPayments(listRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filterType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hostel & Mess Fee Collections</h1>
          <p className="text-gray-600 mt-1">
            Real-time tracking of online student fee payments • Shaheed Bhagat Singh Hostel
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 self-start md:self-auto transition-colors"
        >
          <span>🖨️</span> Print Collections Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Total Collected</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-lg">💰</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">
            ₹{(stats?.totalRevenue || 0).toLocaleString()}
          </div>
          <p className="text-xs text-gray-400 mt-2">{stats?.totalTransactions || 0} total receipts issued</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Past 7 Days</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg text-lg">📅</span>
          </div>
          <div className="text-3xl font-extrabold text-blue-600">
            ₹{(stats?.recentWeekRevenue || 0).toLocaleString()}
          </div>
          <p className="text-xs text-gray-400 mt-2">Recent week fee collections</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Mess Fee Share</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg text-lg">🍲</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            ₹{(stats?.byType?.find((t) => t.payment_type === 'Mess Bill')?.total || 0).toLocaleString()}
          </div>
          <p className="text-xs text-gray-400 mt-2">Food & catering funds collected</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Preferred Mode</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg text-lg">⚡</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            UPI / QR Code
          </div>
          <p className="text-xs text-gray-400 mt-2">Instant direct settlement</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-medium text-gray-500">Filter Fee Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="All">All Types</option>
            <option value="Mess Bill">Mess Bill</option>
            <option value="Hostel Fee">Hostel Fee</option>
            <option value="Maintenance Fee">Maintenance Fee</option>
            <option value="Caution Deposit">Caution Deposit</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="number"
            min="1"
            max="500"
            placeholder="Search Room (1-500)..."
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Search
          </button>
          {roomSearch && (
            <button
              type="button"
              onClick={() => {
                setRoomSearch('');
                setTimeout(fetchPayments, 0);
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="text-4xl">💳</span>
            <p className="mt-2 font-medium">No payment transactions recorded.</p>
            <p className="text-xs text-gray-400 mt-1">
              Students can pay their mess bills and hostel fees online from their portal.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs">
                <tr>
                  <th className="px-6 py-3">Receipt No.</th>
                  <th className="px-6 py-3">Student & Room</th>
                  <th className="px-6 py-3">Fee Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Payment Method</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-emerald-800">
                      {p.receipt_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-primary-100 text-primary-800 font-bold text-xs">
                        Room {p.room_no}
                      </span>
                      <p className="text-xs font-semibold text-gray-900 mt-0.5">{p.student_name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 text-xs">
                      {p.payment_type}
                      {p.month_year && <span className="text-gray-400 block text-[11px]">{p.month_year}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-extrabold text-emerald-700">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                      {p.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold transition-colors"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Hostel Fee Receipt</h3>
              <p className="text-xs text-gray-500">Shaheed Bhagat Singh Hostel • NIT Kurukshetra</p>
              <span className="inline-block mt-1 font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                #{selectedReceipt.receipt_no}
              </span>
            </div>

            <div className="my-4 space-y-2 text-xs bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-500">Student:</span>
                <span className="font-semibold">{selectedReceipt.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Room:</span>
                <span className="font-semibold">Room {selectedReceipt.room_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-semibold">{selectedReceipt.payment_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-bold text-emerald-700">₹{selectedReceipt.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mode:</span>
                <span>{selectedReceipt.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono text-[11px]">{selectedReceipt.transaction_id}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
