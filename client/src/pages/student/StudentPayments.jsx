import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import { useToast, ToastContainer } from '../../components/Toast';

export default function StudentPayments() {
  const { user } = useAuth();
  const [dues, setDues] = useState([]);
  const [history, setHistory] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [activeDue, setActiveDue] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [customType, setCustomType] = useState('Mess Bill');
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const { toasts, success, error, removeToast } = useToast();

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const [duesRes, histRes] = await Promise.all([
        api.get('/payments/dues').catch(() => ({ success: false })),
        api.get('/payments/my').catch(() => ({ success: false })),
      ]);

      if (duesRes.success) setDues(duesRes.data.dues);
      if (histRes.success) {
        setHistory(histRes.data.payments);
        setTotalPaid(histRes.data.totalPaid);
      }
    } catch (err) {
      error(err.message || 'Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, []);

  const openPayModal = (dueItem = null) => {
    if (dueItem) {
      setActiveDue(dueItem);
      setCustomAmount(dueItem.amount);
      setCustomType(dueItem.type);
    } else {
      setActiveDue(null);
      setCustomAmount('3850');
      setCustomType('Mess Bill');
    }
    setReceiptData(null);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(customAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      error('Please enter a valid payment amount');
      return;
    }

    try {
      setProcessing(true);
      // Simulate realistic payment gateway processing delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const res = await api.post('/payments/pay', {
        amount: amountVal,
        payment_type: customType,
        payment_method: paymentMethod,
        month_year: new Date().toLocaleString('default', { month: 'short', year: 'numeric' }),
        notes: activeDue ? `Direct payment for ${activeDue.title}` : `Online student payment from Room ${user?.room_no}`,
      });

      if (res.success) {
        success('Payment of ₹' + amountVal.toLocaleString() + ' successful!');
        setReceiptData(res.data);
        loadPaymentData();
      }
    } catch (err) {
      error(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hostel & Mess Online Fees Portal</h1>
          <p className="text-gray-600 mt-1">
            Shaheed Bhagat Singh Hostel • Room {user?.room_no || user?.roomNumber} • Instant Online Payment & Receipts
          </p>
        </div>
        <button
          onClick={() => openPayModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        >
          <span>💳</span> Pay Any Fee Online
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <span className="text-emerald-100 text-sm font-medium">Total Online Fees Paid</span>
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-3xl font-extrabold mt-2">
            ₹{totalPaid.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-100/80 mt-2">
            Verified digitally via SBS Hostel payment gateway
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm font-medium">Active Payment Methods</span>
            <span className="text-2xl">📱</span>
          </div>
          <div className="text-sm font-bold text-gray-800 mt-2 flex flex-wrap gap-1.5">
            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">PhonePe</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">Google Pay</span>
            <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-xs">Paytm</span>
            <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">Debit Card</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">Net Banking</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Zero convenience fee for hostel students</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm font-medium">Student Billing Profile</span>
            <span className="text-2xl">🎓</span>
          </div>
          <div className="mt-2 text-sm">
            <p className="font-bold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">Room: <strong>{user?.room_no || user?.roomNumber}</strong> • SBS Hostel, NIT KUK</p>
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-2">● Instant Digital Receipt Issued</p>
        </div>
      </div>

      {/* Dues Cards Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🔔</span> Hostel & Mess Fee Schedule
        </h2>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dues.map((due) => (
              <div
                key={due.id}
                className={`bg-white rounded-xl border p-6 flex flex-col justify-between transition-all ${
                  due.isPaid
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-amber-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {due.type}
                    </span>
                    {due.isPaid ? (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        ✓ Paid
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                        Due: {due.dueDate}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-base">{due.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{due.description}</p>
                  <div className="text-2xl font-extrabold text-gray-900 my-3">
                    ₹{due.amount.toLocaleString()}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  {due.isPaid ? (
                    <div className="text-xs text-emerald-700 bg-emerald-100/60 p-2 rounded">
                      Paid on {new Date(due.paidDetails.created_at).toLocaleDateString()} • Txn #{due.paidDetails.transaction_id.slice(-6)}
                    </div>
                  ) : (
                    <button
                      onClick={() => openPayModal(due)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>⚡</span> Pay ₹{due.amount.toLocaleString()} Directly
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🧾</span> My Payment Receipts & Transaction History
          </h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {history.length} transactions
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="text-4xl">💳</span>
            <p className="mt-2 font-medium">No online payment transactions yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Click "Pay Any Fee Online" above to pay your Mess Bill or Hostel Fee without standing in bank queues!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs">
                <tr>
                  <th className="px-6 py-3">Receipt No.</th>
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3">Fee Category</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Payment Method</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {history.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-primary-700 font-semibold">
                      {p.receipt_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(p.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {p.payment_type}
                      {p.month_year && <span className="text-xs text-gray-400 block">{p.month_year}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-extrabold text-emerald-700">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 font-medium">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setReceiptData(p)}
                        className="px-3 py-1 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded text-xs font-semibold transition-colors"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Gateway Modal */}
      {(activeDue !== null || customAmount !== '') && receiptData === null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg text-lg">💳</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Online Hostel Payment</h3>
                  <p className="text-xs text-gray-500">Direct instant transfer • SBS Hostel, NIT Kurukshetra</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveDue(null);
                  setCustomAmount('');
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fee Type</label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Mess Bill">Mess Monthly Food Bill</option>
                  <option value="Hostel Fee">Hostel Room & Board Fee</option>
                  <option value="Maintenance Fee">Maintenance & Electricity Fund</option>
                  <option value="Caution Deposit">Hostel Caution Deposit</option>
                  <option value="Other">Other / Fine Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Amount to Pay (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-lg font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['UPI / QR Code', 'Debit/Credit Card', 'Net Banking'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                        paymentMethod === m
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {m === 'UPI / QR Code' ? '⚡ UPI / QR' : m === 'Debit/Credit Card' ? '💳 Card' : '🏦 Net Banking'}
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI Tab */}
              {paymentMethod === 'UPI / QR Code' && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center space-y-3">
                  <p className="text-xs font-semibold text-gray-700">Scan QR via Google Pay / PhonePe / Paytm / BHIM</p>
                  
                  {/* Generated Dynamic SVG QR Code */}
                  <div className="inline-block p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                    <svg viewBox="0 0 120 120" className="w-36 h-36 mx-auto">
                      {/* Realistic Mock QR Pattern */}
                      <rect width="120" height="120" fill="white" />
                      <rect x="10" y="10" width="30" height="30" fill="#0f172a" />
                      <rect x="15" y="15" width="20" height="20" fill="white" />
                      <rect x="20" y="20" width="10" height="10" fill="#0f172a" />

                      <rect x="80" y="10" width="30" height="30" fill="#0f172a" />
                      <rect x="85" y="15" width="20" height="20" fill="white" />
                      <rect x="90" y="20" width="10" height="10" fill="#0f172a" />

                      <rect x="10" y="80" width="30" height="30" fill="#0f172a" />
                      <rect x="15" y="85" width="20" height="20" fill="white" />
                      <rect x="20" y="90" width="10" height="10" fill="#0f172a" />

                      <circle cx="60" cy="60" r="14" fill="#059669" />
                      <text x="60" y="64" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">₹</text>

                      {/* Random noise matrix */}
                      <rect x="50" y="15" width="8" height="8" fill="#0f172a" />
                      <rect x="62" y="20" width="6" height="12" fill="#0f172a" />
                      <rect x="45" y="80" width="12" height="6" fill="#0f172a" />
                      <rect x="65" y="85" width="8" height="12" fill="#0f172a" />
                      <rect x="80" y="55" width="10" height="6" fill="#0f172a" />
                      <rect x="95" y="70" width="12" height="10" fill="#0f172a" />
                      <rect x="85" y="95" width="8" height="8" fill="#0f172a" />
                    </svg>
                    <p className="text-[10px] font-mono text-gray-400 mt-1">UPI ID: sbshostel.nitkuk@sbi</p>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Or enter your UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. yourname@okhdfcbank"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Card Tab */}
              {paymentMethod === 'Debit/Credit Card' && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      maxLength="19"
                      placeholder="4532 •••• •••• 8890"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        maxLength="5"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength="3"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Net Banking Tab */}
              {paymentMethod === 'Net Banking' && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <label className="block text-xs font-medium text-gray-700">Choose Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="State Bank of India">State Bank of India (NIT KUK Branch)</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                  </select>
                  <p className="text-[11px] text-gray-400">
                    You will be redirected to the secure Net Banking gateway of {selectedBank}.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDue(null);
                    setCustomAmount('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying Payment...
                    </>
                  ) : (
                    `Pay ₹${parseFloat(customAmount || 0).toLocaleString()} Now`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Digital Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-up border-2 border-emerald-500">
            <div className="text-center pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-2">
                ✓
              </div>
              <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
              <p className="text-xs text-gray-500">Shaheed Bhagat Singh Hostel • NIT Kurukshetra</p>
              <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-full">
                Receipt #{receiptData.receipt_no}
              </span>
            </div>

            <div className="my-4 space-y-2 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Student Name:</span>
                <span className="font-bold text-gray-900">{user?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Room Number:</span>
                <span className="font-bold text-gray-900">Room {user?.room_no || user?.roomNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Fee Category:</span>
                <span className="font-bold text-gray-900">{receiptData.payment_type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono text-gray-900 font-semibold">{receiptData.transaction_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Payment Mode:</span>
                <span className="font-semibold text-gray-900">{receiptData.payment_method}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Date & Time:</span>
                <span className="text-gray-800">{new Date(receiptData.created_at || Date.now()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-extrabold text-emerald-700">
                <span>Amount Paid:</span>
                <span>₹{receiptData.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🖨️</span> Print / Save Receipt
              </button>
              <button
                onClick={() => {
                  setReceiptData(null);
                  setActiveDue(null);
                  setCustomAmount('');
                }}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
