const jwt = require('jsonwebtoken');

const JWT_SECRET = 'sbs_hostel_nitkuk_secret_2024';

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
}

function authenticateWarden(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'warden') {
      return res.status(403).json({ success: false, error: 'Warden access required' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
}

module.exports = { authenticateToken, authenticateWarden, JWT_SECRET };
