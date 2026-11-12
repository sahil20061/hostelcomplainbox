import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';

export default function MessMenuPage() {
  const [menuData, setMenuData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayTab, setSelectedDayTab] = useState('Monday');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const MEAL_ICONS = {
    Breakfast: '🥞',
    Lunch: '🍛',
    Snacks: '☕',
    Dinner: '🍲',
  };

  const MEAL_GRADIENTS = {
    Breakfast: 'from-amber-500 to-orange-500',
    Lunch: 'from-blue-600 to-indigo-600',
    Snacks: 'from-rose-500 to-pink-500',
    Dinner: 'from-purple-600 to-indigo-800',
  };

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        const [todayTomorrowRes, weekRes] = await Promise.all([
          api.get('/mess/menu/today-tomorrow').catch(() => ({ success: false })),
          api.get('/mess/menu/week').catch(() => ({ success: false })),
        ]);

        if (todayTomorrowRes.success) {
          setMenuData(todayTomorrowRes.data);
          // Set default selected weekly tab to tomorrow's day
          if (todayTomorrowRes.data?.tomorrow?.dayName) {
            setSelectedDayTab(todayTomorrowRes.data.tomorrow.dayName);
          }
        }
        if (weekRes.success) setWeeklyData(weekRes.data.byDay);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const tomorrow = menuData?.tomorrow;
  const today = menuData?.today;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>🍲</span> Shaheed Bhagat Singh Hostel Mess Menu
            </h1>
            <p className="text-gray-600 mt-1">
              NIT Kurukshetra • Daily & Tomorrow's Food Schedule • Unlimited Healthy Meals
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Menu Active & Verified by Mess Committee
          </div>
        </div>
      </div>

      {/* HIGHLIGHT: AGLE DIN KA KHANA (TOMORROW'S MENU) */}
      {tomorrow && (
        <div className="mb-12 bg-gradient-to-br from-indigo-900 via-primary-900 to-blue-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-white/10 rounded-2xl">✨</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-gray-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      AGLE DIN KA KHANA (TOMORROW)
                    </span>
                    <span className="text-primary-200 text-xs font-semibold">
                      • {tomorrow.dateString}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black mt-1">
                    What's Cooking Tomorrow ({tomorrow.dayName})?
                  </h2>
                </div>
              </div>
            </div>

            {/* Tomorrow's 4 Meals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tomorrow.meals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 flex flex-col justify-between hover:bg-white/15 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{MEAL_ICONS[meal.meal_type]}</span>
                      <span className="text-[11px] font-mono text-primary-200 bg-black/20 px-2 py-0.5 rounded-full">
                        {meal.timing}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{meal.meal_type}</h3>
                    <p className="text-primary-100 text-sm leading-relaxed font-medium">
                      {meal.items}
                    </p>
                  </div>

                  {meal.special_item && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                        <span>⭐ Special:</span> {meal.special_item}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TODAY'S MENU SECTION */}
      {today && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>📅</span> Today's Menu ({today.dayName} • {today.dateString})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {today.meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl p-2 rounded-xl bg-gray-50">
                      {MEAL_ICONS[meal.meal_type]}
                    </span>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      {meal.timing}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base mb-1.5">{meal.meal_type}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{meal.items}</p>
                </div>

                {meal.special_item && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Special: {meal.special_item}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WEEKLY TIMETABLE EXPLORER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>🗓️</span> Weekly Mess Schedule (7 Days)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select any day of the week to inspect full breakfast, lunch, evening snacks, and dinner menu
            </p>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDayTab(day)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedDayTab === day
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Meals for Selected Day */}
        {weeklyData && weeklyData[selectedDayTab] ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {weeklyData[selectedDayTab].map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{MEAL_ICONS[m.meal_type]}</span>
                    <span className="text-[11px] font-medium text-gray-500">
                      {m.timing}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mb-1">{m.meal_type}</h4>
                  <p className="text-gray-700 text-xs leading-relaxed">{m.items}</p>
                </div>
                {m.special_item && (
                  <div className="mt-3 pt-2 border-t border-gray-200/80">
                    <span className="text-[11px] font-bold text-primary-700">
                      ⭐ {m.special_item}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500 text-sm">No menu data available for {selectedDayTab}.</p>
        )}
      </div>
    </div>
  );
}
