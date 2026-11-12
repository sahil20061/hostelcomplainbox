import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (role === 'warden') return <Navigate to="/warden/login" replace />;
    return <Navigate to="/student/login" replace />;
  }

  if (role && user?.role !== role) {
    if (user?.role === 'warden') return <Navigate to="/warden/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}
