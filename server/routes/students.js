const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateWarden } = require('../middleware/auth');

// GET /api/students/stats - Student statistics (warden only)
router.get('/stats', authenticateWarden, (req, res) => {
  try {
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;

    const roomsOccupied = db.prepare('SELECT COUNT(DISTINCT room_no) as count FROM students').get().count;

    const recentRegistrations = db.prepare(
      `SELECT COUNT(*) as count FROM students WHERE created_at >= datetime('now', '-7 days')`
    ).get().count;

    res.json({
      success: true,
      data: {
        totalRegistered: totalStudents,
        roomsOccupied,
        totalRooms: 500,
        occupancyRate: Math.round((roomsOccupied / 500) * 100 * 100) / 100,
        recentRegistrations
      }
    });
  } catch (err) {
    console.error('Get student stats error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/students - Get all students (warden only)
router.get('/', authenticateWarden, (req, res) => {
  try {
    const students = db.prepare(
      'SELECT id, name, room_no, email, phone, created_at FROM students ORDER BY room_no ASC'
    ).all();

    res.json({ success: true, data: students });
  } catch (err) {
    console.error('Get students error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
