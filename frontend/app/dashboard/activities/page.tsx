'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Activity, ACTIVITY_ICONS, ACTIVITY_COLORS } from '@/types/activity';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'note', note: '' });
  const [saving, setSaving] = useState(false);

  const fetchActivities = async () => {
    try {
      const res = await api.get('/api/activities');
      setActivities(res.data);
    } catch (err) {
      console.error('Failed to fetch activities', err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchActivities();
}, []);

  const handleCreate = async () => {
    if (!form.note.trim()) return;
    setSaving(true);
    try {
      await api.post('/api/activities', form);
      setForm({ type: 'note', note: '' });
      setShowForm(false);
      fetchActivities();
    } catch (err) {
      console.error('Failed to create activity', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/api/activities/${id}`);
    fetchActivities();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Activities</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          + Log Activity
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">New Activity</h2>
          <div className="grid grid-cols-1 gap-4">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="call">📞 Call</option>
              <option value="email">✉️ Email</option>
              <option value="note">📝 Note</option>
              <option value="meeting">🤝 Meeting</option>
            </select>
            <textarea
              placeholder="What happened?"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={3}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No activities logged yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${ACTIVITY_COLORS[activity.type]}`}
                >
                  {ACTIVITY_ICONS[activity.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 capitalize">
                      {activity.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(activity.created_at)}
                    </span>
                  </div>
                  {activity.note && (
                    <p className="text-sm text-gray-600 mt-1">{activity.note}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}