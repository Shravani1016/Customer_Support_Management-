'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { Activity, ACTIVITY_ICONS, ACTIVITY_COLORS } from '@/types/activity';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'note', note: '' });
  const [saving, setSaving] = useState(false);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

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
    try {
      await api.delete(`/api/activities/${id}`);
      fetchActivities();
    } catch (err) {
      console.error(err);
    }
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

  const filteredActivities = useMemo(() => {
    return activities
      .filter((activity) => {
        const matchesSearch =
          activity.note?.toLowerCase().includes(search.toLowerCase()) ||
          activity.type.toLowerCase().includes(search.toLowerCase());

        const matchesType =
          filterType === 'all' || activity.type === filterType;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const first = new Date(a.created_at).getTime();
        const second = new Date(b.created_at).getTime();

        return sortOrder === 'latest'
          ? second - first
          : first - second;
      });
  }, [activities, search, filterType, sortOrder]);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Activities
        </h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          + Log Activity
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-black"
          >
            <option value="all">All Types</option>
            <option value="call">📞 Call</option>
            <option value="email">✉️ Email</option>
            <option value="note">📝 Note</option>
            <option value="meeting">🤝 Meeting</option>
          </select>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as 'latest' | 'oldest')
            }
            className="border rounded-lg px-3 py-2 text-sm text-black"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* Clear */}
          <button
            onClick={() => {
              setSearch('');
              setFilterType('all');
              setSortOrder('latest');
            }}
            className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-100 text-black"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Add Activity Form */}
      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">
            New Activity
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-sm text-black"
            >
              <option value="call">📞 Call</option>
              <option value="email">✉️ Email</option>
              <option value="note">📝 Note</option>
              <option value="meeting">🤝 Meeting</option>
            </select>

            <textarea
              rows={3}
              placeholder="What happened?"
              value={form.note}
              onChange={(e) =>
                setForm({ ...form, note: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="border border-gray-300 px-4 py-2 text-sm text-black"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Activities */}
      <div className="bg-white rounded-xl border shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Loading activities...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No matching activities found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition"
              >
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
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.note}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(activity.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
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