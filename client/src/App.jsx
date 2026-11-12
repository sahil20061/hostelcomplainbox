import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import StudentSignup from './pages/auth/StudentSignup';
import StudentLogin from './pages/auth/StudentLogin';
import WardenLogin from './pages/auth/WardenLogin';
import StudentDashboard from './pages/student/StudentDashboard';
import NewComplaint from './pages/student/NewComplaint';
import MyComplaints from './pages/student/MyComplaints';
import NewMessReview from './pages/student/NewMessReview';
import MessReviews from './pages/student/MessReviews';
import WardenDashboard from './pages/warden/WardenDashboard';
import ManageComplaints from './pages/warden/ManageComplaints';
import BudgetManager from './pages/warden/BudgetManager';
import ViewMessReviews from './pages/warden/ViewMessReviews';
import StudentDirectory from './pages/warden/StudentDirectory';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/warden/login" element={<WardenLogin />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/complaints" element={<ProtectedRoute role="student"><MyComplaints /></ProtectedRoute>} />
        <Route path="/student/complaints/new" element={<ProtectedRoute role="student"><NewComplaint /></ProtectedRoute>} />
        <Route path="/student/mess-reviews" element={<ProtectedRoute role="student"><MessReviews /></ProtectedRoute>} />
        <Route path="/student/mess-reviews/new" element={<ProtectedRoute role="student"><NewMessReview /></ProtectedRoute>} />

        {/* Warden Routes */}
        <Route path="/warden/dashboard" element={<ProtectedRoute role="warden"><WardenDashboard /></ProtectedRoute>} />
        <Route path="/warden/complaints" element={<ProtectedRoute role="warden"><ManageComplaints /></ProtectedRoute>} />
        <Route path="/warden/budget" element={<ProtectedRoute role="warden"><BudgetManager /></ProtectedRoute>} />
        <Route path="/warden/mess-reviews" element={<ProtectedRoute role="warden"><ViewMessReviews /></ProtectedRoute>} />
        <Route path="/warden/students" element={<ProtectedRoute role="warden"><StudentDirectory /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
