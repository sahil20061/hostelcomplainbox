import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isStudent, isWarden, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-primary-700 text-white'
        : 'text-primary-100 hover:bg-primary-700/50 hover:text-white'
    }`;

  const studentLinks = [
    { to: '/student/dashboard', label: '📊 Dashboard' },
    { to: '/student/complaints', label: '📋 My Complaints' },
    { to: '/student/complaints/new', label: '➕ New Complaint' },
    { to: '/student/mess-reviews', label: '⭐ Mess Reviews' },
    { to: '/student/mess-reviews/new', label: '✍️ Review Mess' },
  ];

  const wardenLinks = [
    { to: '/warden/dashboard', label: '📊 Dashboard' },
    { to: '/warden/complaints', label: '📋 Complaints' },
    { to: '/warden/budget', label: '💰 Budget' },
    { to: '/warden/mess-reviews', label: '⭐ Mess Reviews' },
    { to: '/warden/students', label: '👥 Students' },
  ];

  const links = isStudent ? studentLinks : isWarden ? wardenLinks : [];

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-gradient-to-r from-primary-800 to-primary-900 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={isWarden ? '/warden/dashboard' : '/student/dashboard'}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <div className="w-9 h-9 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center text-xl">
              🏠
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-sm leading-tight">Shaheed Bhagat Singh Hostel</h1>
              <p className="text-primary-300 text-xs">NIT Kurukshetra</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className={linkClass(link.to)}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* User section */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-primary-200 text-sm">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="hidden xl:block">
                <p className="text-white text-xs font-medium leading-tight">{user?.name}</p>
                <p className="text-primary-300 text-xs capitalize">{user?.role}{user?.roomNumber ? ` • Room ${user.roomNumber}` : ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:block text-sm bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 font-medium"
            >
              Logout
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-white p-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-primary-700">
          <div className="px-4 py-3 space-y-1">
            <div className="flex items-center gap-3 pb-3 mb-2 border-b border-primary-700">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{user?.name}</p>
                <p className="text-primary-300 text-xs capitalize">{user?.role}{user?.roomNumber ? ` • Room ${user.roomNumber}` : ''}</p>
              </div>
            </div>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={linkClass(link.to)}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left mt-2 px-3 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
