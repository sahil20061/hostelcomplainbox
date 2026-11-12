const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, authenticateWarden } = require('../middleware/auth');

const VALID_TYPES = ['Mess Bill', 'Hostel Fee', 'Maintenance Fee', 'Caution Deposit', 'Other'];
const VALID_METHODS = ['UPI / QR Code', 'Debit/Credit Card', 'Net Banking'];

// POST /api/payments/pay - Student makes a direct online payment
router.post('/pay', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can make payments' });
    }

    const { amount, payment_type, payment_method, month_year, notes } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Please enter a valid payment amount' });
    }

    if (!payment_type || !VALID_TYPES.includes(payment_type)) {
      return res.status(400).json({ success: false, error: `Invalid payment type. Must be one of: ${VALID_TYPES.join(', ')}` });
    }

    if (!payment_method || !VALID_METHODS.includes(payment_method)) {
      return res.status(400).json({ success: false, error: `Invalid payment method. Must be one of: ${VALID_METHODS.join(', ')}` });
    }

    const amt = parseFloat(amount);
    const txnId = `TXN-SBS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNo = `REC-SBS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const result = db.prepare(`
      INSERT INTO payments (
        student_id, room_no, amount, payment_type, payment_method,
        transaction_id, receipt_no, status, month_year, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Success', ?, ?)
    `).run(
      req.user.id,
      req.user.room_no,
      amt,
      payment_type,
      payment_method,
      txnId,
      receiptNo,
      month_year || new Date().toLocaleString('default', { month: 'short', year: 'numeric' }),
      notes || null
    );

    const payment = db.prepare(`
      SELECT p.*, s.name as student_name, s.email as student_email
      FROM payments p
      JOIN students s ON p.student_id = s.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment processed successfully! Digital receipt generated.'
    });
  } catch (err) {
    console.error('Payment processing error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error while processing payment' });
  }
});

// GET /api/payments/my - Student views their payment history
router.get('/my', authenticateToken, (req, res) => {
  try {
    const payments = db.prepare(`
      SELECT * FROM payments 
      WHERE student_id = ? 
      ORDER BY created_at DESC
    `).all(req.user.id);

    const totalPaid = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM payments 
      WHERE student_id = ? AND status = 'Success'
    `).get(req.user.id).total;

    res.json({
      success: true,
      data: {
        payments,
        totalPaid
      }
    });
  } catch (err) {
    console.error('Get my payments error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/payments/dues - Student checks standard semester / monthly dues
router.get('/dues', authenticateToken, (req, res) => {
  try {
    // Current dues calculation based on typical NIT Kurukshetra hostel fee structure
    const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

    // Check if mess bill for this month is paid
    const messPaid = db.prepare(`
      SELECT * FROM payments 
      WHERE student_id = ? AND payment_type = 'Mess Bill' AND month_year = ? AND status = 'Success'
    `).get(req.user.id, currentMonth);

    // Check if hostel room fee is paid
    const hostelPaid = db.prepare(`
      SELECT * FROM payments 
      WHERE student_id = ? AND payment_type = 'Hostel Fee' AND status = 'Success'
    `).get(req.user.id);

    // Check if maintenance fee is paid
    const maintPaid = db.prepare(`
      SELECT * FROM payments 
      WHERE student_id = ? AND payment_type = 'Maintenance Fee' AND status = 'Success'
    `).get(req.user.id);

    const dues = [
      {
        id: 'mess_curr',
        title: `Mess Bill (${currentMonth})`,
        amount: 3850,
        type: 'Mess Bill',
        isPaid: !!messPaid,
        paidDetails: messPaid || null,
        dueDate: '10th of every month',
        description: 'Monthly unlimited veg & special feast mess subscription'
      },
      {
        id: 'hostel_sem',
        title: 'Hostel Room & Board Fee (Semester)',
        amount: 14000,
        type: 'Hostel Fee',
        isPaid: !!hostelPaid,
        paidDetails: hostelPaid || null,
        dueDate: 'Semester Start',
        description: 'Hostel room occupancy, water & sanitation charges'
      },
      {
        id: 'maint_ann',
        title: 'Electricity & Maintenance Fund',
        amount: 2500,
        type: 'Maintenance Fee',
        isPaid: !!maintPaid,
        paidDetails: maintPaid || null,
        dueDate: 'Annual',
        description: 'Common room, fan, lighting & electrical infrastructure'
      }
    ];

    res.json({
      success: true,
      data: {
        dues,
        studentRoom: req.user.room_no
      }
    });
  } catch (err) {
    console.error('Get student dues error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/payments - Warden gets all fee transactions
router.get('/', authenticateWarden, (req, res) => {
  try {
    const { room_no, payment_type, status } = req.query;

    let query = `
      SELECT p.*, s.name as student_name, s.email as student_email, s.phone as student_phone
      FROM payments p
      JOIN students s ON p.student_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (room_no) {
      query += ' AND p.room_no = ?';
      params.push(parseInt(room_no));
    }

    if (payment_type && VALID_TYPES.includes(payment_type)) {
      query += ' AND p.payment_type = ?';
      params.push(payment_type);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.created_at DESC';

    const payments = db.prepare(query).all(...params);

    res.json({ success: true, data: payments });
  } catch (err) {
    console.error('Get all payments error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/payments/stats - Warden fee collection analytics
router.get('/stats', authenticateWarden, (req, res) => {
  try {
    const totalCollected = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count 
      FROM payments 
      WHERE status = 'Success'
    `).get();

    const byType = db.prepare(`
      SELECT payment_type, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
      FROM payments
      WHERE status = 'Success'
      GROUP BY payment_type
    `).all();

    const byMethod = db.prepare(`
      SELECT payment_method, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
      FROM payments
      WHERE status = 'Success'
      GROUP BY payment_method
    `).all();

    const recentWeek = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE status = 'Success' AND created_at >= datetime('now', '-7 days')
    `).get().total;

    res.json({
      success: true,
      data: {
        totalRevenue: totalCollected.total,
        totalTransactions: totalCollected.count,
        byType,
        byMethod,
        recentWeekRevenue: recentWeek
      }
    });
  } catch (err) {
    console.error('Get payment stats error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
