const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/student/signup
router.post('/student/signup', (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const roomInput = req.body.room_no !== undefined ? req.body.room_no : req.body.roomNumber;

    // Validate required fields
    if (!name || roomInput === undefined || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, room number, email, and password are required' });
    }

    // Validate room number
    const roomNum = parseInt(roomInput);
    if (isNaN(roomNum) || roomNum < 1 || roomNum > 500) {
      return res.status(400).json({ success: false, error: 'Room number must be between 1 and 500' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existingEmail = db.prepare('SELECT id FROM students WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    // Check if room is already taken
    const existingRoom = db.prepare('SELECT id FROM students WHERE room_no = ?').get(roomNum);
    if (existingRoom) {
      return res.status(409).json({ success: false, error: 'Room number already registered' });
    }

    // Hash password and insert
    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO students (name, room_no, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)'
    ).run(name, roomNum, email, phone || null, passwordHash);

    // Generate JWT
    const token = jwt.sign(
      { id: result.lastInsertRowid, name, room_no: roomNum, role: 'student' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: result.lastInsertRowid, name, room_no: roomNum, email, role: 'student' }
      }
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/auth/student/login
router.post('/student/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const student = db.prepare('SELECT * FROM students WHERE email = ?').get(email);
    if (!student) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const validPassword = bcrypt.compareSync(password, student.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: student.id, name: student.name, room_no: student.room_no, role: 'student' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: { id: student.id, name: student.name, room_no: student.room_no, email: student.email, role: 'student' }
      }
    });
  } catch (err) {
    console.error('Student login error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/auth/warden/login
router.post('/warden/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const warden = db.prepare('SELECT * FROM wardens WHERE email = ?').get(email);
    if (!warden) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const validPassword = bcrypt.compareSync(password, warden.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: warden.id, name: warden.name, role: 'warden' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: { id: warden.id, name: warden.name, email: warden.email, role: 'warden' }
      }
    });
  } catch (err) {
    console.error('Warden login error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    if (req.user.role === 'student') {
      const student = db.prepare('SELECT id, name, room_no, email, phone, created_at FROM students WHERE id = ?').get(req.user.id);
      if (!student) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, data: { ...student, role: 'student' } });
    } else if (req.user.role === 'warden') {
      const warden = db.prepare('SELECT id, name, email, created_at FROM wardens WHERE id = ?').get(req.user.id);
      if (!warden) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, data: { ...warden, role: 'warden' } });
    } else {
      res.status(400).json({ success: false, error: 'Invalid role' });
    }
  } catch (err) {
    console.error('Get me error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
