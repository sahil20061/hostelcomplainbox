import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';
import { useToast, ToastContainer } from '../../components/Toast';

const BUDGET_CATEGORIES = [
  'Electrical & Fans',
  'Plumbing & Sanitation',
  'Carpentry & Windows',
  'Pest Control & Cleanliness',
  'Mess & Kitchen Equipment',
  'Drinking Water & RO Filter',
  'Hostel Security & CCTV',
  'Sports & Common Room',
  'Emergency & Contingency',
  'General Maintenance',
];

export default function BudgetManager() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [newSpentValue, setNewSpentValue] = useState('');

  // New Budget Form
  const [formCategory, setFormCategory] = useState(BUDGET_CATEGORIES[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const { toasts, success, error, removeToast } = useToast();

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      const [entriesRes, summaryRes] = await Promise.all([
        api.get('/budget'),
        api.get('/budget/summary'),
      ]);

      if (entriesRes.success) setEntries(entriesRes.data);
      if (summaryRes.success) setSummary(summaryRes.data);
    } catch (err) {
      error(err.message || 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgetData();
  }, []);

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!formAmount || parseFloat(formAmount) <= 0) {
      error('Please enter a valid allocation amount');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/budget', {
        category: formCategory,
        description: formDescription,
        amount_allocated: parseFloat(formAmount),
        date: formDate,
      });

      if (res.success) {
        success(`Successfully allocated ₹${parseFloat(formAmount).toLocaleString()} for ${formCategory}!`);
        setShowAddModal(false);
        setFormDescription('');
        setFormAmount('');
        loadBudgetData();
      }
    } catch (err) {
      error(err.message || 'Failed to pass budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSpent = async (e) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      setSubmitting(true);
      const res = await api.patch(`/budget/${editingEntry.id}`, {
        amount_spent: parseFloat(newSpentValue || 0),
      });

      if (res.success) {
        success('Updated amount spent successfully');
        setEditingEntry(null);
        loadBudgetData();
      }
    } catch (err) {
      error(err.message || 'Failed to update spent amount');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to remove this budget allocation entry?')) return;

    try {
      const res = await api.delete(`/budget/${id}`);
      if (res.success) {
        success('Budget entry deleted');
        loadBudgetData();
      }
    } catch (err) {
      error(err.message || 'Failed to delete budget entry');
    }
  };

  const totalAllocated = summary?.totals?.allocated || 0;
  const totalSpent = summary?.totals?.spent || 0;
  const remaining = summary?.totals?.remaining || 0;
  const spentPct = totalAllocated > 0 ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hostel Maintenance & Budget Manager</h1>
          <p className="text-gray-600 mt-1">
            Pass, allocate, and record funds approved for Shaheed Bhagat Singh Hostel
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
        >
          <span>➕</span> Pass New Budget
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm font-medium">Total Budget Approved/Passed</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-lg">💰</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">
            ₹{totalAllocated.toLocaleString()}
          </div>
          <p className="text-xs text-gray-400 mt-2">Total funds approved for hostel upkeep</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm font-medium">Total Funds Utilized / Spent</span>
            <span className="p-2 bg-red-50 text-red-600 rounded-lg text-lg">💸</span>
          </div>
          <div className="text-3xl font-extrabold text-red-600">
            ₹{totalSpent.toLocaleString()}
          </div>
          <p className="text-xs text-gray-400 mt-2">{spentPct}% of allocated budget utilized</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm font-medium">Available Balance</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg text-lg">🏦</span>
          </div>
          <div
            className={`text-3xl font-extrabold ${
              remaining >= 0 ? 'text-blue-700' : 'text-red-600'
            }`}
          >
            ₹{remaining.toLocaleString()}
          </div>
          <p className="text-xs text-gray-400 mt-2">Remaining funds ready to be disbursed</p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Budget Utilization</span>
          <span className="text-sm font-bold text-gray-900">{spentPct}%</span>
        </div>
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spentPct > 90 ? 'bg-red-500' : spentPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${spentPct}%` }}
          ></div>
        </div>
      </div>

      {/* Budget Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Passed Budget Entries & Expenditures</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
            {entries.length} allocations
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="text-4xl">📋</span>
            <p className="mt-2 font-medium">No budget allocations recorded yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Click "Pass New Budget" to set up maintenance funds for fans, windows, mess, etc.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs">
                <tr>
                  <th className="px-6 py-3">Date Passed</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Purpose / Description</th>
                  <th className="px-6 py-3">Allocated Amount</th>
                  <th className="px-6 py-3">Spent Amount</th>
                  <th className="px-6 py-3">Remaining</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {entries.map((item) => {
                  const rem = item.amount_allocated - (item.amount_spent || 0);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {item.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 max-w-xs text-gray-600 text-xs">
                        {item.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-emerald-700">
                        ₹{item.amount_allocated.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-red-600">
                        ₹{(item.amount_spent || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">
                        <span className={rem >= 0 ? 'text-gray-900' : 'text-red-600'}>
                          ₹{rem.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingEntry(item);
                            setNewSpentValue(item.amount_spent || 0);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        >
                          Log Expense
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(item.id)}
                          className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Pass New Budget */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Pass / Allocate Hostel Budget</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddBudget} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Budget Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Allocated Amount (in ₹ INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 50000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date Passed / Approved
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Purpose / Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Replaced 15 ceiling fan motors in Block B and repaired window latches"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Passing Budget...' : 'Approve & Pass Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Spent Amount */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100">
              Log Expenditure for {editingEntry.category}
            </h3>
            <p className="text-xs text-gray-500 my-2">
              Allocated Budget: <strong>₹{editingEntry.amount_allocated.toLocaleString()}</strong>
            </p>

            <form onSubmit={handleUpdateSpent} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Total Amount Spent So Far (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={newSpentValue}
                  onChange={(e) => setNewSpentValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Update Spent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
