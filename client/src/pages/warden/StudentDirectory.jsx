import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';

export default function StudentDirectory() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadDirectory() {
      try {
        setLoading(true);
        const [studentsRes, statsRes] = await Promise.all([
          api.get('/students'),
          api.get('/students/stats'),
        ]);

        if (studentsRes.success) setStudents(studentsRes.data);
        if (statsRes.success) setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDirectory();
  }, []);

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.room_no.toString().includes(q) ||
      (s.phone && s.phone.includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hostel Student Directory</h1>
        <p className="text-gray-600 mt-1">
          Shaheed Bhagat Singh Hostel • 500 Rooms Roster & Registrations
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Registered Students
          </span>
          <div className="text-3xl font-extrabold text-primary-700 mt-1">
            {stats?.totalRegistered || 0}
            <span className="text-sm font-normal text-gray-400"> / 500</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Active hostel residents</span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Rooms Occupied
          </span>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">
            {stats?.roomsOccupied || 0}
            <span className="text-sm font-normal text-gray-400"> / 500</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Individual room assignments</span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Occupancy Rate
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">
            {stats?.occupancyRate || 0}%
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Hostel capacity utilized</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by student name, room (1-500), email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>
        <span className="text-xs text-gray-500 font-medium">
          Showing {filteredStudents.length} of {students.length} students
        </span>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
          <span className="text-4xl">👥</span>
          <h3 className="text-lg font-bold text-gray-800 mt-2">No Students Found</h3>
          <p className="text-gray-500 text-sm mt-1">
            {search ? 'No student records match your search filter.' : 'No students registered yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs">
                <tr>
                  <th className="px-6 py-3">Room No</th>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">NIT Email Address</th>
                  <th className="px-6 py-3">Phone Number</th>
                  <th className="px-6 py-3">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded bg-primary-100 text-primary-800 font-bold text-xs">
                        Room {s.room_no}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {s.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-xs">
                      {s.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-xs">
                      {s.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
