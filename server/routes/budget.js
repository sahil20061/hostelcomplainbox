const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateWarden } = require('../middleware/auth');

// POST /api/budget - Add budget entry (warden only)
router.post('/', authenticateWarden, (req, res) => {
  try {
    const { category, description, amount_allocated, date } = req.body;

    if (!category || amount_allocated === undefined || !date) {
      return res.status(400).json({ success: false, error: 'Category, amount_allocated, and date are required' });
    }

    const amount = parseFloat(amount_allocated);
    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({ success: false, error: 'Amount allocated must be a non-negative number' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ success: false, error: 'Date must be in YYYY-MM-DD format' });
    }

    const result = db.prepare(
      'INSERT INTO budget (category, description, amount_allocated, date) VALUES (?, ?, ?, ?)'
    ).run(category.trim(), description || null, amount, date);

    const entry = db.prepare('SELECT * FROM budget WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error('Create budget error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/budget/summary - Total allocated vs spent by category (warden only)
router.get('/summary', authenticateWarden, (req, res) => {
  try {
    const summary = db.prepare(`
      SELECT category,
             SUM(amount_allocated) as total_allocated,
             SUM(amount_spent) as total_spent,
             SUM(amount_allocated) - SUM(amount_spent) as remaining,
             COUNT(*) as entries
      FROM budget
      GROUP BY category
      ORDER BY total_allocated DESC
    `).all();

    const totals = db.prepare(`
      SELECT SUM(amount_allocated) as total_allocated,
             SUM(amount_spent) as total_spent,
             SUM(amount_allocated) - SUM(amount_spent) as remaining
      FROM budget
    `).get();

    res.json({
      success: true,
      data: {
        byCategory: summary,
        totals: {
          allocated: totals.total_allocated || 0,
          spent: totals.total_spent || 0,
          remaining: totals.remaining || 0
        }
      }
    });
  } catch (err) {
    console.error('Get budget summary error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/budget - Get all budget entries (warden only)
router.get('/', authenticateWarden, (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = 'SELECT * FROM budget WHERE 1=1';
    const params = [];

    if (start_date) {
      query += ' AND date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const entries = db.prepare(query).all(...params);

    res.json({ success: true, data: entries });
  } catch (err) {
    console.error('Get budget entries error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/budget/:id - Update budget entry (warden only)
router.patch('/:id', authenticateWarden, (req, res) => {
  try {
    const { id } = req.params;
    const { amount_spent } = req.body;

    const entry = db.prepare('SELECT * FROM budget WHERE id = ?').get(id);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'Budget entry not found' });
    }

    if (amount_spent === undefined) {
      return res.status(400).json({ success: false, error: 'amount_spent is required' });
    }

    const spent = parseFloat(amount_spent);
    if (isNaN(spent) || spent < 0) {
      return res.status(400).json({ success: false, error: 'amount_spent must be a non-negative number' });
    }

    db.prepare('UPDATE budget SET amount_spent = ? WHERE id = ?').run(spent, id);

    const updated = db.prepare('SELECT * FROM budget WHERE id = ?').get(id);

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update budget error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/budget/:id - Delete budget entry (warden only)
router.delete('/:id', authenticateWarden, (req, res) => {
  try {
    const { id } = req.params;

    const entry = db.prepare('SELECT * FROM budget WHERE id = ?').get(id);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'Budget entry not found' });
    }

    db.prepare('DELETE FROM budget WHERE id = ?').run(id);

    res.json({ success: true, data: { message: 'Budget entry deleted successfully' } });
  } catch (err) {
    console.error('Delete budget error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
