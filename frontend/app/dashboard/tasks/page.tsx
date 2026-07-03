'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Task } from '@/types';
import toast from 'react-hot-toast';

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/tasks');
      setTasks(res.data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleCreate = async () => {
    if (!form.title) { toast.error('Title is required!'); return; }
    try {
      setSaving(true);
      await api.post('/api/tasks', form);
      setForm({ title: '', description: '', priority: 'medium' });
      setShowForm(false);
      toast.success('Task created successfully!');
      fetchTasks();
    } catch {
      toast.error('Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (task: Task) => {
    try {
      await api.put(`/api/tasks/${task.id}`, { is_completed: !task.is_completed });
      toast.success(task.is_completed ? 'Task marked as pending!' : 'Task completed!');
      fetchTasks();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      await api.delete(`/api/tasks/${task.id}`);
      setTasks(prev => prev.filter(t => t.id !== task.id));
      toast.success('Task deleted!');
    } catch (err) {
      console.error('Failed to delete task', err);
      toast.error('Failed to delete task');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setStatusFilter('all');
  };

  const exportCSV = async () => {
    try {
      const res = await api.get('/api/tasks/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tasks.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query));

    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    let matchesStatus = true;
    if (statusFilter === 'done') matchesStatus = task.is_completed === true;
    else if (statusFilter === 'pending') matchesStatus = task.is_completed === false;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition"
          >
            + Add Task
          </button>
          <button
            onClick={exportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-3 text-slate-900">New Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              placeholder="Title *"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <select
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm text-black"
            >
              {['low', 'medium', 'high'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row gap-3 mb-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 w-full border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-gray-100/50 transition-colors"
              />
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-500 uppercase">Priority:</label>
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="h-10 border rounded-lg px-3 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-500 uppercase">Status:</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="h-10 border rounded-lg px-3 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="done">Done</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {(searchQuery || priorityFilter !== 'all' || statusFilter !== 'all') && (
                <button onClick={handleClearFilters} className="text-sm text-blue-600 hover:underline">
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-2">
            {tasks.length === 0
              ? 'No tasks available'
              : `Showing ${filteredTasks.length} of ${tasks.length} tasks`}
          </div>

          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  {['Done', 'Title', 'Description', 'Priority', 'Status', 'Actions'].map(h => (
                    <th key={h} className="p-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-gray-400">No tasks yet.</td></tr>
                ) : filteredTasks.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-gray-400">No tasks match your search criteria.</td></tr>
                ) : (
                  filteredTasks.map(task => (
                    <tr key={task.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={task.is_completed}
                          onChange={() => handleComplete(task)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className={`p-3 font-medium ${task.is_completed ? 'line-through text-gray-400' : 'text-slate-900'}`}>
                        {task.title}
                      </td>
                      <td className="p-3 text-gray-600">{task.description || '—'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        {task.is_completed ? '✅ Done' : '⏳ Pending'}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDelete(task)}
                          className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium text-sm cursor-pointer px-2 py-1 rounded-md transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}