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

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    room_no INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_type TEXT NOT NULL CHECK(payment_type IN ('Mess Bill', 'Hostel Fee', 'Maintenance Fee', 'Caution Deposit', 'Other')),
    payment_method TEXT NOT NULL CHECK(payment_method IN ('UPI / QR Code', 'Debit/Credit Card', 'Net Banking')),
    transaction_id TEXT NOT NULL UNIQUE,
    receipt_no TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'Success' CHECK(status IN ('Success', 'Pending', 'Failed')),
    month_year TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS mess_menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week TEXT NOT NULL CHECK(day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    meal_type TEXT NOT NULL CHECK(meal_type IN ('Breakfast', 'Lunch', 'Snacks', 'Dinner')),
    timing TEXT NOT NULL,
    items TEXT NOT NULL,
    special_item TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(day_of_week, meal_type)
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

// Seed default weekly mess menu (Monday through Sunday)
const menuCount = db.prepare('SELECT COUNT(*) as count FROM mess_menu').get().count;
if (menuCount === 0) {
  const defaultMenu = [
    // Monday
    { day: 'Monday', meal: 'Breakfast', timing: '7:30 AM - 9:30 AM', items: 'Aloo Paratha (2 pcs), Fresh Curd, Pickle, Butter, Hot Tea / Milk', special: 'Stuffed Aloo Paratha' },
    { day: 'Monday', meal: 'Lunch', timing: '12:30 PM - 2:30 PM', items: 'Dal Tadka, Seasonal Mix Veg, Jeera Rice, Tawa Roti, Boondi Raita, Green Salad', special: 'Boondi Raita' },
    { day: 'Monday', meal: 'Snacks', timing: '5:00 PM - 6:00 PM', items: 'Crispy Samosa with Mint & Tamarind Chutney, Masala Chai', special: 'Hot Samosas' },
    { day: 'Monday', meal: 'Dinner', timing: '8:00 PM - 10:00 PM', items: 'Kadhai Paneer, Dal Makhani, Steamed Rice, Butter Roti, Gulab Jamun (1 pc)', special: 'Gulab Jamun Dessert' },

    // Tuesday
    { day: 'Tuesday', meal: 'Breakfast', timing: '7:30 AM - 9:30 AM', items: 'Indori Poha with Roasted Peanuts & Sev, Boiled Eggs / Banana, Tea / Coffee', special: 'Lemon Poha' },
    { day: 'Tuesday', meal: 'Lunch', timing: '12:30 PM - 2:30 PM', items: 'Rajma Masala (Punjabi Style), steamed Basmati Rice, Chapati, Salad, Papad', special: 'Rajma Chawal Special' },
    { day: 'Tuesday', meal: 'Snacks', timing: '5:00 PM - 6:00 PM', items: 'Veg Cutlet / Bread Pakora with Green Chutney, Adrak Tea', special: 'Crispy Bread Pakora' },
    { day: 'Tuesday', meal: 'Dinner', timing: '8:00 PM - 10:00 PM', items: 'Dum Aloo Kashmiri, Yellow Moong Dal, Jeera Pulao, Chapati, Suji Halwa', special: 'Desi Ghee Suji Halwa' },

    // Wednesday
    { day: 'Wednesday', meal: 'Breakfast', timing: '7:30 AM - 9:30 AM', items: 'Crispy Onion & Paneer Uttapam, Coconut Chutney, Sambar, Tea / Milk', special: 'South Indian Uttapam' },
    { day: 'Wednesday', meal: 'Lunch', timing: '12:30 PM - 2:30 PM', items: 'Kadhi Pakoda, steamed Rice, Aloo Bhindi Fry, Phulka, Onion Salad, Roasted Papad', special: 'Punjabi Kadhi Pakoda' },
    { day: 'Wednesday', meal: 'Snacks', timing: '5:00 PM - 6:00 PM', items: 'Aloo Bonda / Bhel Puri, Lemon Tea / Hot Tea', special: 'Spicy Bhel Puri' },
    { day: 'Wednesday', meal: 'Dinner', timing: '8:00 PM - 10:00 PM', items: 'Paneer Butter Masala / Egg Curry, Dal Fry, Jeera Rice, Tandoori Roti, Rasgulla', special: 'Paneer Butter Masala' },

    // Thursday
    { day: 'Thursday', meal: 'Breakfast', timing: '7:30 AM - 9:30 AM', items: 'Methi Thepla / Puri Bhaji with Spiced Potato Curry, Pickle, Curd, Tea', special: 'Puri Aloo Bhaji' },
    { day: 'Thursday', meal: 'Lunch', timing: '12:30 PM - 2:30 PM', items: 'Chhole Bhature, Cucumber Raita, Fried Green Chillies, Lemon Pickle', special: 'Chhole Bhature Feast' },
    { day: 'Thursday', meal: 'Snacks', timing: '5:00 PM - 6:00 PM', items: 'Grilled Veg Sandwich with Cheese, Filter Coffee / Tea', special: 'Cheese Veg Sandwich' },
    { day: 'Thursday', meal: 'Dinner', timing: '8:00 PM - 10:00 PM', items: 'Malai Kofta, Dal Panchmel, Veg Pulao, Chapati, Fresh Seasonal Fruit', special: 'Creamy Malai Kofta' },

    // Friday
    { day: 'Friday', meal: 'Breakfast', timing: '7:30 AM - 9:30 AM', items: 'Steamed Idli & Medu Vada, Coconut Chutney, Piping Hot Sambar, Filter Coffee', special: 'Idli Vada Sambar' },
    { day: 'Friday', meal: 'Lunch', timing: '12:30 PM - 2:30 PM', items: 'Lobia Masala, Aloo Gobi Matar, steamed Rice, Phulka, Boondi Raita, Salad', special: 'Aloo Gobi Matar' },
    { day: 'Friday', meal: 'Snacks', timing: '5:00 PM - 6:00 PM', items: 'Spring Rolls with Sweet Chilli Sauce, Masala Chai', special: 'Crispy Spring Rolls' },
    { day: 'Friday', meal: 'Dinner', timing: '8:00 PM - 10:00 PM', items: 'Shahi Paneer, Dal Arhar, Kashmiri Pulao, Butter Naan / Roti, Rice Kheer', special: 'Kesar Rice Kheer' },

    // Saturday
    { day: 'Saturday', meal: 'Breakfast', timing: '7:30 AM - 9:30 AM', items: 'Paneer & Onion Paratha, Green Chutney, Butter Cubes, Dahi, Hot Tea / Milk', special: 'Special Stuffed Paratha' },
    { day: 'Saturday', meal: 'Lunch', timing: '12:30 PM - 2:30 PM', items: 'Hyderabadi Veg Biryani with Mirchi Ka Salan, Burani Raita, Roasted Papad, Salad', special: 'Hyderabadi Biryani' },
    { day: 'Saturday', meal: 'Snacks', timing: '5:00 PM - 6:00 PM', items: 'Pav Bhaji with Extra Butter, Chopped Onions, Lemon, Hot Tea', special: 'Butter Pav Bhaji' },
    { day: 'Saturday', meal: 'Dinner', timing: '8:00 PM - 10:00 PM', items: 'Matar Mushroom / Soya Chaap Curry, Dal Tadka, Steamed Rice, Chapati, Ice Cream Cup', special: 'Ice Cream Cup' },

    // Sunday
    { day: 'Sunday', meal: 'Breakfast', timing: '8:00 AM - 10:00 AM', items: 'Special Masala Dosa with Potato Masala, Red & White Chutney, Drumstick Sambar, Coffee', special: 'Crispy Masala Dosa' },
    { day: 'Sunday', meal: 'Lunch', timing: '12:30 PM - 2:30 PM', items: 'Pindi Chhole, Basmati Rice, Palak Paneer, Butter Roti, Sweet Lassi / Buttermilk', special: 'Amritsari Kulche Chhole' },
    { day: 'Sunday', meal: 'Snacks', timing: '5:00 PM - 6:00 PM', items: 'Veg Maggi / Macaroni with Tomato Ketchup, Hot Tea', special: 'Hostel Special Maggi' },
    { day: 'Sunday', meal: 'Dinner', timing: '8:00 PM - 10:00 PM', items: 'Paneer Tikka Masala, Dal Makhani, Jeera Rice, Garlic Naan / Tawa Roti, Moong Dal Halwa', special: 'Weekend Grand Feast' }
  ];

  const insertMenu = db.prepare(`
    INSERT INTO mess_menu (day_of_week, meal_type, timing, items, special_item)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const item of defaultMenu) {
    insertMenu.run(item.day, item.meal, item.timing, item.items, item.special);
  }
  console.log('Default 7-day mess menu seeded.');
}

module.exports = db;
