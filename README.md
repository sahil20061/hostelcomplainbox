# 🏠 Shaheed Bhagat Singh Hostel - Complaint & Mess Review Portal

**NIT Kurukshetra, India**

A full-stack web application for managing hostel complaints, mess food reviews, and budget tracking for Shaheed Bhagat Singh Hostel (500 students).

## Features

### Students
- **Register & Login** with room number (1-500)
- **Submit Complaints** across categories: Fan, Window, Electrical, Plumbing, Pest/Mouse, Furniture, Other
- **Track Complaint Status** (Pending → In Progress → Resolved/Rejected)
- **Rate Mess Food** for Breakfast, Lunch, Snacks, and Dinner (1-5 stars)
- **View Reviews** and meal ratings

### Warden
- **Manage Complaints** - View, filter, update status, and add remarks
- **View Complaint Statistics** - By category, status, resolution time
- **Budget Management** - Track allocated vs spent amounts by category
- **Student Directory** - View registered students and occupancy stats
- **Mess Review Analytics** - Average ratings by meal type

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (via better-sqlite3)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Frontend**: React + Vite (in `/client`)

## Getting Started

### Prerequisites
- Node.js 18+

### Installation

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install
```

### Running in Development

```bash
# Run both server and client
npm run dev

# Or run separately:
npm run server   # Backend on http://localhost:5000
npm run client   # Frontend on http://localhost:5173
```

### Production Build

```bash
npm run build    # Build the React frontend
npm start        # Serve everything from Express
```

## Default Warden Account

- **Email**: warden@sbshostel.nitkuk.ac.in
- **Password**: warden123

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/student/signup` | Register a new student |
| POST | `/api/auth/student/login` | Student login |
| POST | `/api/auth/warden/login` | Warden login |
| GET | `/api/auth/me` | Get current user info |

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaints` | Submit a complaint (student) |
| GET | `/api/complaints/my` | Get my complaints (student) |
| GET | `/api/complaints` | Get all complaints (warden) |
| PATCH | `/api/complaints/:id` | Update complaint (warden) |
| GET | `/api/complaints/stats` | Complaint statistics (warden) |

### Mess Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mess/reviews` | Submit a review (student) |
| GET | `/api/mess/reviews` | Get all reviews (paginated) |
| GET | `/api/mess/reviews/my` | Get my reviews (student) |
| GET | `/api/mess/reviews/stats` | Rating statistics |

### Budget (Warden Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/budget` | Add budget entry |
| GET | `/api/budget` | Get budget entries |
| PATCH | `/api/budget/:id` | Update budget entry |
| DELETE | `/api/budget/:id` | Delete budget entry |
| GET | `/api/budget/summary` | Budget summary by category |

### Students (Warden Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Get all students |
| GET | `/api/students/stats` | Student/occupancy stats |

## Project Structure

```
hostel-complaint-box/
├── package.json
├── .gitignore
├── .env.example
├── README.md
├── server/
│   ├── index.js            # Express server entry point
│   ├── database.js         # SQLite setup & seeding
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   └── routes/
│       ├── auth.js         # Authentication routes
│       ├── complaints.js   # Complaint CRUD routes
│       ├── mess.js         # Mess review routes
│       ├── budget.js       # Budget management routes
│       └── students.js     # Student management routes
└── client/                 # React frontend (Vite)
```

## License

MIT
