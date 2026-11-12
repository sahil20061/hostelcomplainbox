const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const VALID_MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

// POST /api/mess/reviews - Student submits a mess review
router.post('/reviews', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can submit reviews' });
    }

    const { rating, comment, date } = req.body;
    const meal_type = req.body.meal_type || req.body.mealType;

    if (!rating || !meal_type || !date) {
      return res.status(400).json({ success: false, error: 'Rating, meal type, and date are required' });
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    if (!VALID_MEAL_TYPES.includes(meal_type)) {
      return res.status(400).json({ success: false, error: `Invalid meal type. Must be one of: ${VALID_MEAL_TYPES.join(', ')}` });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ success: false, error: 'Date must be in YYYY-MM-DD format' });
    }

    // Check one review per meal per day per student
    const existingReview = db.prepare(
      'SELECT id FROM mess_reviews WHERE student_id = ? AND meal_type = ? AND date = ?'
    ).get(req.user.id, meal_type, date);

    if (existingReview) {
      return res.status(409).json({ success: false, error: 'You have already reviewed this meal for this date' });
    }

    const result = db.prepare(
      'INSERT INTO mess_reviews (student_id, rating, comment, meal_type, date) VALUES (?, ?, ?, ?, ?)'
    ).run(req.user.id, ratingNum, comment || null, meal_type, date);

    const review = db.prepare('SELECT * FROM mess_reviews WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error('Create review error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/mess/reviews/stats - Average ratings by meal type
router.get('/reviews/stats', (req, res) => {
  try {
    // Last 7 days stats
    const last7Days = db.prepare(`
      SELECT meal_type, 
             ROUND(AVG(rating), 2) as avg_rating, 
             COUNT(*) as total_reviews
      FROM mess_reviews 
      WHERE date >= date('now', '-7 days')
      GROUP BY meal_type
      ORDER BY CASE meal_type 
        WHEN 'Breakfast' THEN 1 
        WHEN 'Lunch' THEN 2 
        WHEN 'Snacks' THEN 3 
        WHEN 'Dinner' THEN 4 
      END
    `).all();

    // Overall stats
    const overall = db.prepare(`
      SELECT meal_type, 
             ROUND(AVG(rating), 2) as avg_rating, 
             COUNT(*) as total_reviews
      FROM mess_reviews 
      GROUP BY meal_type
      ORDER BY CASE meal_type 
        WHEN 'Breakfast' THEN 1 
        WHEN 'Lunch' THEN 2 
        WHEN 'Snacks' THEN 3 
        WHEN 'Dinner' THEN 4 
      END
    `).all();

    // Overall average
    const overallAvg = db.prepare(
      'SELECT ROUND(AVG(rating), 2) as avg_rating, COUNT(*) as total_reviews FROM mess_reviews'
    ).get();

    res.json({
      success: true,
      data: {
        last7Days,
        overall,
        overallAverage: overallAvg.avg_rating || 0,
        totalReviews: overallAvg.total_reviews || 0
      }
    });
  } catch (err) {
    console.error('Get review stats error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/mess/reviews/my - Student's own reviews
router.get('/reviews/my', authenticateToken, (req, res) => {
  try {
    const reviews = db.prepare(
      'SELECT * FROM mess_reviews WHERE student_id = ? ORDER BY date DESC, created_at DESC'
    ).all(req.user.id);

    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error('Get my reviews error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/mess/reviews - Get all reviews with pagination
router.get('/reviews', (req, res) => {
  try {
    const { date, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let countQuery = 'SELECT COUNT(*) as total FROM mess_reviews';
    let dataQuery = `
      SELECT mr.*, s.name as student_name, s.room_no 
      FROM mess_reviews mr 
      JOIN students s ON mr.student_id = s.id
    `;
    const params = [];

    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ success: false, error: 'Date must be in YYYY-MM-DD format' });
      }
      countQuery += ' WHERE date = ?';
      dataQuery += ' WHERE mr.date = ?';
      params.push(date);
    }

    const total = db.prepare(countQuery).get(...params).total;

    dataQuery += ' ORDER BY mr.date DESC, mr.created_at DESC LIMIT ? OFFSET ?';

    const reviews = db.prepare(dataQuery).all(...params, limitNum, offset);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (err) {
    console.error('Get all reviews error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
