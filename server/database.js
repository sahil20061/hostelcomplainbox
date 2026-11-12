const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'hostel.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    room_no INTEGER NOT NULL UNIQUE CHECK(room_no >= 1 AND room_no <= 500),
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wardens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Fan', 'Window', 'Electrical', 'Plumbing', 'Pest/Mouse', 'Furniture', 'Other')),
    description TEXT NOT NULL,
    room_no INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Progress', 'Resolved', 'Rejected')),
    warden_remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS mess_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    meal_type TEXT NOT NULL CHECK(meal_type IN ('Breakfast', 'Lunch', 'Snacks', 'Dinner')),
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    description TEXT,
    amount_allocated REAL NOT NULL,
    amount_spent REAL DEFAULT 0,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default warden if not exists
const defaultWardens = [
  { name: 'Chief Warden', email: 'warden@sbshostel.nitkuk.ac.in', pass: 'warden123' },
  { name: 'Hostel Warden', email: 'warden@nitkkr.ac.in', pass: 'warden123' },
  { name: 'Hostel Warden', email: 'warden@nitkuk.ac.in', pass: 'warden123' }
];

for (const w of defaultWardens) {
  const existing = db.prepare('SELECT id FROM wardens WHERE email = ?').get(w.email);
  if (!existing) {
    const hash = bcrypt.hashSync(w.pass, 10);
    db.prepare('INSERT INTO wardens (name, email, password_hash) VALUES (?, ?, ?)').run(
      w.name,
      w.email,
      hash
    );
    console.log(`Warden account seeded: ${w.email}`);
  }
}

module.exports = db;
