import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';
import { useToast, ToastContainer } from '../../components/Toast';

export default function WardenMessMenu() {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [editingMeal, setEditingMeal] = useState(null);
  const [formItems, setFormItems] = useState('');
  const [formTiming, setFormTiming] = useState('');
  const [formSpecial, setFormSpecial] = useState('');
  const [saving, setSaving] = useState(false);

  const { toasts, success, error, removeToast } = useToast();

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const MEAL_ICONS = {
    Breakfast: '🥞',
    Lunch: '🍛',
    Snacks: '☕',
    Dinner: '🍲',
  };

  const loadMenuData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mess/menu/week');
      if (res.success) {
        setWeeklyData(res.data.byDay);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch weekly mess menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  const openEditModal = (meal) => {
    setEditingMeal(meal);
    setFormItems(meal.items);
    setFormTiming(meal.timing);
    setFormSpecial(meal.special_item || '');
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    if (!formItems.trim()) {
      error('Please specify the meal food items');
      return;
    }

    try {
      setSaving(true);
      const res = await api.put(`/mess/menu/${editingMeal.id}`, {
        items: formItems.trim(),
        timing: formTiming.trim(),
        special_item: formSpecial.trim(),
      });

      if (res.success) {
        success(`${editingMeal.day_of_week} ${editingMeal.meal_type} menu updated! Students will see it immediately.`);
        setEditingMeal(null);
        loadMenuData();
      }
    } catch (err) {
      error(err.message || 'Failed to update menu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span>🍲</span> Manage Mess Food Schedule (Agle Din Ka Khana)
          </h1>
          <p className="text-gray-600 mt-1">
            Update daily & next-day meal items for 500 hostel students • Changes reflect instantly
          </p>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              selectedDay === day
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Meal Items Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : weeklyData && weeklyData[selectedDay] ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {weeklyData[selectedDay].map((meal) => (
            <div
              key={meal.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl p-2 bg-primary-50 rounded-xl">
                      {MEAL_ICONS[meal.meal_type]}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{meal.meal_type}</h3>
                      <span className="text-xs font-mono text-gray-400">{meal.timing}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal(meal)}
                    className="px-3.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold rounded-lg text-xs transition-colors"
                  >
                    ✏️ Edit Menu
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 my-3">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">
                    Scheduled Food Items
                  </span>
                  <p className="text-gray-800 text-sm font-medium leading-relaxed">
                    {meal.items}
                  </p>
                </div>
              </div>

              {meal.special_item ? (
                <div className="mt-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 p-2.5 rounded-lg flex items-center justify-between">
                  <span>⭐ Special Dish: {meal.special_item}</span>
                  <span className="text-[10px] text-amber-600">Active</span>
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-400 italic">No special item specified for this meal.</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-10 text-gray-500">No menu data available.</p>
      )}

      {/* Edit Meal Modal */}
      {editingMeal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{MEAL_ICONS[editingMeal.meal_type]}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Edit {editingMeal.day_of_week} {editingMeal.meal_type}
                  </h3>
                  <p className="text-xs text-gray-500">Update what students will eat on this meal</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMeal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Meal Timings
                </label>
                <input
                  type="text"
                  required
                  value={formTiming}
                  onChange={(e) => setFormTiming(e.target.value)}
                  placeholder="e.g. 7:30 AM - 9:30 AM"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Food Items (Separate with commas)
                </label>
                <textarea
                  rows="4"
                  required
                  value={formItems}
                  onChange={(e) => setFormItems(e.target.value)}
                  placeholder="e.g. Kadhai Paneer, Dal Makhani, Steamed Basmati Rice, Butter Roti, Gulab Jamun"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
                ></textarea>
                <p className="text-[11px] text-gray-400 mt-1">
                  Students see this prominently under "Agle Din Ka Khana" and on their dashboard.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Special Dish / Dessert (Optional)
                </label>
                <input
                  type="text"
                  value={formSpecial}
                  onChange={(e) => setFormSpecial(e.target.value)}
                  placeholder="e.g. Kesar Kheer or Paneer Butter Masala"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingMeal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Publishing Updates...' : 'Save & Publish Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
