'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { Activity, ACTIVITY_ICONS, ACTIVITY_COLORS } from '@/types/activity';
import toast from 'react-hot-toast';

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

  const exportCSV = async () => {
    try {
      const res = await api.get('/api/activities/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'activities.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported');
    } catch {
      toast.error('Failed to export CSV');
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Activities
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg hover:opacity-90 shadow-lg shadow-indigo-500/20 text-sm font-medium transition"
          >
            + Log Activity
          </button>
          <button
            onClick={exportCSV}
            className="border border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-sm font-medium transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-xl p-4 mb-6 shadow-md shadow-gray-200/50 dark:shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-black dark:text-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-black dark:text-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-black dark:text-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="border dark:border-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-black dark:text-white transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Add Activity Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-xl p-6 mb-6 shadow-md shadow-gray-200/50 dark:shadow-none">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
            New Activity
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
              className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-black dark:text-white dark:bg-gray-900"
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
              className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-black dark:text-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-black dark:text-gray-300 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Activities — timeline style */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-md shadow-gray-200/50 dark:shadow-none">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            No matching activities found.
          </div>
        ) : (
          <div className="relative px-6">
            {/* Timeline connector line running behind the icons */}
            <div className="absolute left-11 top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-700/50" />

            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="relative flex items-start gap-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 hover:translate-x-0.5 transition-all rounded-lg -mx-2 px-2"
                >
                  <div
                    className={`relative z-10 w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg ring-4 ring-white dark:ring-gray-800 ${ACTIVITY_COLORS[activity.type]}`}
                  >
                    {ACTIVITY_ICONS[activity.type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 dark:text-gray-100 capitalize">
                        {activity.type}
                      </span>

                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatTime(activity.created_at)}
                      </span>
                    </div>

                    {activity.note && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {activity.note}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs px-2 py-1 rounded-md transition shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}