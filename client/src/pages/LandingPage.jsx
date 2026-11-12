import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function LandingPage() {
  const { isAuthenticated, isWarden } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isWarden ? '/warden/dashboard' : '/student/dashboard'} replace />;
  }

  const features = [
    {
      icon: '📋',
      title: 'Complaint System',
      desc: 'Report hostel issues like faulty fans, plumbing problems, or pest infestations. Track status in real-time.',
    },
    {
      icon: '⭐',
      title: 'Mess Reviews',
      desc: 'Rate daily meals, share feedback on food quality, and help improve the mess experience for everyone.',
    },
    {
      icon: '💰',
      title: 'Budget Tracking',
      desc: 'Transparent hostel budget management with category-wise allocation and spending visibility.',
    },
    {
      icon: '👥',
      title: 'Student Directory',
      desc: 'Easy access to registered student information and room allocation details.',
    },
    {
      icon: '📊',
      title: 'Dashboard Analytics',
      desc: 'Visual insights into complaint resolution rates, mess ratings, and budget utilization.',
    },
    {
      icon: '🔔',
      title: 'Status Updates',
      desc: 'Get real-time updates on your complaint status with warden remarks and resolution notes.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-blue-600 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 lg:py-36">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="text-2xl">🏠</span>
              <span className="text-white/90 text-sm font-medium">NIT Kurukshetra, Haryana</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
              Shaheed Bhagat Singh
              <span className="block text-primary-200">Hostel Portal</span>
            </h1>

            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              Your one-stop platform for hostel complaint management, mess food reviews, and budget tracking.
              Making hostel life better, one complaint at a time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/student/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl hover:bg-primary-50 transition-all duration-300 text-lg group"
              >
                🎓 Student Login
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/warden/login"
                className="inline-flex items-center justify-center gap-2 bg-primary-900/50 backdrop-blur text-white font-bold py-3.5 px-8 rounded-xl border border-white/20 hover:bg-primary-900/70 transition-all duration-300 text-lg"
              >
                🛡️ Warden Login
              </Link>
            </div>

            <p className="mt-6 text-primary-200/80 text-sm">
              New student?{' '}
              <Link to="/student/signup" className="text-white underline underline-offset-2 hover:text-primary-100">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L48,69.3C96,75,192,85,288,90.7C384,96,480,96,576,85.3C672,75,768,53,864,48C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="#f9fafb"/>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Everything You Need
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            A comprehensive platform to manage hostel operations efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary-100 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-primary-100 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-lg mb-1">Shaheed Bhagat Singh Hostel</h3>
              <p className="text-sm">National Institute of Technology, Kurukshetra</p>
              <p className="text-sm">Haryana - 136119, India</p>
            </div>
            <div className="text-center md:text-right text-sm">
              <p>Hostel Complaint & Mess Review Portal</p>
              <p className="mt-1">© {new Date().getFullYear()} SBS Hostel, NIT Kurukshetra</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
