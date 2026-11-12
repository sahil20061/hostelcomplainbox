const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, authenticateWarden } = require('../middleware/auth');

const VALID_CATEGORIES = ['Fan', 'Window', 'Electrical', 'Plumbing', 'Pest/Mouse', 'Furniture', 'Other'];
const VALID_STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

// POST /api/complaints - Student submits a complaint
router.post('/', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can submit complaints' });
    }

    const { category, description } = req.body;

    if (!category || !description) {
      return res.status(400).json({ success: false, error: 'Category and description are required' });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Description must be at least 10 characters' });
    }

    const result = db.prepare(
      'INSERT INTO complaints (student_id, category, description, room_no) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, category, description.trim(), req.user.room_no);

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    console.error('Create complaint error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/complaints/my - Student gets their own complaints
router.get('/my', authenticateToken, (req, res) => {
  try {
    const complaints = db.prepare(
      'SELECT * FROM complaints WHERE student_id = ? ORDER BY created_at DESC'
    ).all(req.user.id);

    res.json({ success: true, data: complaints });
  } catch (err) {
    console.error('Get my complaints error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/complaints/stats - Complaint statistics (warden only)
router.get('/stats', authenticateWarden, (req, res) => {
  try {
    const totalComplaints = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;

    const byStatus = db.prepare(
      'SELECT status, COUNT(*) as count FROM complaints GROUP BY status'
    ).all();

    const byCategory = db.prepare(
      'SELECT category, COUNT(*) as count FROM complaints GROUP BY category ORDER BY count DESC'
    ).all();

    const recentComplaints = db.prepare(
      `SELECT COUNT(*) as count FROM complaints 
       WHERE created_at >= datetime('now', '-7 days')`
    ).get().count;

    const avgResolutionTime = db.prepare(
      `SELECT AVG(julianday(updated_at) - julianday(created_at)) as avg_days 
       FROM complaints WHERE status = 'Resolved'`
    ).get().avg_days;

    res.json({
      success: true,
      data: {
        total: totalComplaints,
        byStatus,
        byCategory,
        recentWeek: recentComplaints,
        avgResolutionDays: avgResolutionTime ? Math.round(avgResolutionTime * 100) / 100 : 0
      }
    });
  } catch (err) {
    console.error('Get complaint stats error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/complaints - Warden gets all complaints with filters
router.get('/', authenticateWarden, (req, res) => {
  try {
    const { status, category, room_no } = req.query;

    let query = `
      SELECT c.*, s.name as student_name, s.email as student_email 
      FROM complaints c 
      JOIN students s ON c.student_id = s.id 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
      }
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ success: false, error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
      }
      query += ' AND c.category = ?';
      params.push(category);
    }

    if (room_no) {
      const roomNum = parseInt(room_no);
      if (isNaN(roomNum)) {
        return res.status(400).json({ success: false, error: 'Invalid room number' });
      }
      query += ' AND c.room_no = ?';
      params.push(roomNum);
    }

    query += ' ORDER BY c.created_at DESC';

    const complaints = db.prepare(query).all(...params);

    res.json({ success: true, data: complaints });
  } catch (err) {
    console.error('Get all complaints error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/complaints/:id - Warden updates complaint status & remarks
router.patch('/:id', authenticateWarden, (req, res) => {
  try {
    const { id } = req.params;
    const { status, warden_remarks } = req.body;

    // Check complaint exists
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (warden_remarks !== undefined) {
      updates.push('warden_remarks = ?');
      params.push(warden_remarks);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updates.push("updated_at = datetime('now')");
    params.push(id);

    db.prepare(`UPDATE complaints SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare(
      `SELECT c.*, s.name as student_name, s.email as student_email 
       FROM complaints c JOIN students s ON c.student_id = s.id 
       WHERE c.id = ?`
    ).get(id);

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update complaint error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
