const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database (creates tables and seeds data)
const db = require('./database');

// Import routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const messRoutes = require('./routes/mess');
const budgetRoutes = require('./routes/budget');
const studentRoutes = require('./routes/students');
const paymentRoutes = require('./routes/payments');
const messMenuRoutes = require('./routes/messMenu');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/mess/menu', messMenuRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'OK', timestamp: new Date().toISOString() } });
});

const fs = require('fs');

// Serve static files in production
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// SPA fallback - serve index.html for any non-API route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.send('Shaheed Bhagat Singh Hostel API server is running on port ' + PORT + '. Run the frontend with npm run client or npm run build.');
    }
  } else {
    res.status(404).json({ success: false, error: 'API endpoint not found' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🏠 SBS Hostel Complaint Portal - Server running on http://localhost:${PORT}`);
  console.log(`📋 API Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
