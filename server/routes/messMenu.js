const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateWarden } = require('../middleware/auth');

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// GET /api/mess/menu/today-tomorrow - View today's & tomorrow's scheduled meals
router.get('/today-tomorrow', (req, res) => {
  try {
    const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
    const todayDay = DAYS_OF_WEEK[todayIndex];
    const tomorrowDay = DAYS_OF_WEEK[(todayIndex + 1) % 7];

    const todayMeals = db.prepare(`
      SELECT * FROM mess_menu 
      WHERE day_of_week = ? 
      ORDER BY CASE meal_type 
        WHEN 'Breakfast' THEN 1 
        WHEN 'Lunch' THEN 2 
        WHEN 'Snacks' THEN 3 
        WHEN 'Dinner' THEN 4 
      END
    `).all(todayDay);

    const tomorrowMeals = db.prepare(`
      SELECT * FROM mess_menu 
      WHERE day_of_week = ? 
      ORDER BY CASE meal_type 
        WHEN 'Breakfast' THEN 1 
        WHEN 'Lunch' THEN 2 
        WHEN 'Snacks' THEN 3 
        WHEN 'Dinner' THEN 4 
      END
    `).all(tomorrowDay);

    res.json({
      success: true,
      data: {
        today: {
          dayName: todayDay,
          dateString: new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }),
          meals: todayMeals
        },
        tomorrow: {
          dayName: tomorrowDay,
          dateString: new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }),
          meals: tomorrowMeals
        }
      }
    });
  } catch (err) {
    console.error('Get today/tomorrow menu error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/mess/menu/week - View full 7-day weekly schedule
router.get('/week', (req, res) => {
  try {
    const allMenu = db.prepare(`
      SELECT * FROM mess_menu 
      ORDER BY CASE day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
      END,
      CASE meal_type
        WHEN 'Breakfast' THEN 1
        WHEN 'Lunch' THEN 2
        WHEN 'Snacks' THEN 3
        WHEN 'Dinner' THEN 4
      END
    `).all();

    // Group by day of week
    const weekly = {};
    for (const item of allMenu) {
      if (!weekly[item.day_of_week]) {
        weekly[item.day_of_week] = [];
      }
      weekly[item.day_of_week].push(item);
    }

    res.json({
      success: true,
      data: {
        raw: allMenu,
        byDay: weekly
      }
    });
  } catch (err) {
    console.error('Get weekly menu error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/mess/menu/:id - Warden updates meal items or timing
router.put('/:id', authenticateWarden, (req, res) => {
  try {
    const { id } = req.params;
    const { items, timing, special_item } = req.body;

    const existing = db.prepare('SELECT * FROM mess_menu WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Menu entry not found' });
    }

    if (!items || !items.trim()) {
      return res.status(400).json({ success: false, error: 'Food items description cannot be empty' });
    }

    db.prepare(`
      UPDATE mess_menu 
      SET items = ?, timing = COALESCE(?, timing), special_item = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(items.trim(), timing ? timing.trim() : null, special_item ? special_item.trim() : null, id);

    const updated = db.prepare('SELECT * FROM mess_menu WHERE id = ?').get(id);

    res.json({
      success: true,
      data: updated,
      message: `${existing.day_of_week} ${existing.meal_type} menu updated successfully!`
    });
  } catch (err) {
    console.error('Update menu error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
