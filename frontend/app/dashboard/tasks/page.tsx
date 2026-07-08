'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Task } from '@/types';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, List as ListIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
};

const statusColors: Record<string, string> = {
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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
      const payload = {
        ...form,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null
      };
      await api.post('/api/tasks', payload);
      setForm({ title: '', description: '', priority: 'medium', due_date: '' });
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

  const formatFriendlyDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setForm({ title: '', description: '', priority: 'medium', due_date: localDateStr });
    setShowForm(true);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const totalDays = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);

    const prevMonthDaysTotal = getDaysInMonth(year, month - 1);
    const calendarCells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Fill previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      calendarCells.push({
        date: new Date(year, month - 1, prevMonthDaysTotal - i),
        isCurrentMonth: false,
      });
    }

    // Fill current month days
    for (let i = 1; i <= totalDays; i++) {
      calendarCells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Fill next month padding to make complete rows of 7
    const remainingCells = 42 - calendarCells.length; // 6 rows max
    for (let i = 1; i <= remainingCells; i++) {
      calendarCells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    const today = new Date();

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-xl overflow-hidden shadow-md shadow-gray-200/50 dark:shadow-none p-4">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
            {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1.5 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 text-xs font-medium text-gray-600 dark:text-gray-300 transition"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell, idx) => {
            const isToday =
              cell.date.getDate() === today.getDate() &&
              cell.date.getMonth() === today.getMonth() &&
              cell.date.getFullYear() === today.getFullYear();

            // Filter tasks for this day
            const dayTasks = tasks.filter(task => {
              if (!task.due_date) return false;
              const taskDate = new Date(task.due_date);
              return (
                taskDate.getDate() === cell.date.getDate() &&
                taskDate.getMonth() === cell.date.getMonth() &&
                taskDate.getFullYear() === cell.date.getFullYear()
              );
            });

            return (
              <div
                key={idx}
                className={`min-h-25 p-2 border dark:border-gray-700/50 rounded-lg flex flex-col justify-between group transition duration-150 relative ${
                  cell.isCurrentMonth
                    ? 'bg-white dark:bg-gray-800'
                    : 'bg-gray-50/50 dark:bg-gray-900/30 text-gray-400 dark:text-gray-600'
                } ${isToday ? 'ring-2 ring-indigo-500/50 border-indigo-500' : ''}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-xs font-semibold flex items-center justify-center rounded-full w-5 h-5 ${
                      isToday
                        ? 'bg-indigo-600 text-white'
                        : cell.isCurrentMonth
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>
                  <button
                    onClick={() => handleDayClick(cell.date)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded transition cursor-pointer"
                    title="Add Task to this date"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="flex-1 space-y-1 overflow-y-auto max-h-17.5 custom-scrollbar">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplete(task);
                      }}
                      className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 cursor-pointer transition truncate ${
                        task.is_completed
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30 line-through'
                          : task.priority === 'high'
                          ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-800/30'
                          : task.priority === 'medium'
                          ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-800/30'
                          : 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-800/30'
                      }`}
                      title={`${task.title}${task.description ? `: ${task.description}` : ''}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        task.is_completed
                          ? 'bg-emerald-500'
                          : task.priority === 'high'
                          ? 'bg-red-500'
                          : task.priority === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`} />
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Tasks</h1>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border dark:border-gray-700 rounded-lg p-0.5 bg-gray-50 dark:bg-gray-900 mr-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-medium transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <ListIcon size={14} />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-medium transition cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <CalendarIcon size={14} />
              Calendar
            </button>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-linear-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg hover:opacity-90 shadow-lg shadow-indigo-500/20 text-sm font-medium transition cursor-pointer"
          >
            + Add Task
          </button>
          <button
            onClick={exportCSV}
            className="border border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-sm font-medium transition cursor-pointer"
          >
            Export CSV
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg p-4 mb-6 shadow-md shadow-gray-200/50 dark:shadow-none">
          <h2 className="font-semibold mb-3 text-slate-900 dark:text-gray-100">New Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <input
              placeholder="Title *"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-gray-900"
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-gray-900"
            />
            <select
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
              className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-black dark:text-white dark:bg-gray-900"
            >
              {['low', 'medium', 'high'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              type="date"
              value={form.due_date}
              onChange={e => setForm({ ...form, due_date: e.target.value })}
              className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-gray-900"
              title="Due Date"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="bg-linear-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-gray-500 dark:text-gray-400 px-4 py-2 text-sm cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : viewMode === 'calendar' ? (
        renderCalendar()
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
                className="pl-10 pr-4 h-10 w-full border dark:border-gray-600 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100/50 dark:hover:bg-gray-900/70 transition-colors"
              />
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority:</label>
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="h-10 border dark:border-gray-600 rounded-lg px-3 text-sm text-black dark:text-white bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status:</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="h-10 border dark:border-gray-600 rounded-lg px-3 text-sm text-black dark:text-white bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="done">Done</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {(searchQuery || priorityFilter !== 'all' || statusFilter !== 'all') && (
                <button onClick={handleClearFilters} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {tasks.length === 0
              ? 'No tasks available'
              : `Showing ${filteredTasks.length} of ${tasks.length} tasks`}
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg overflow-hidden shadow-md shadow-gray-200/50 dark:shadow-none">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-left">
                <tr>
                  {['Done', 'Title', 'Description', 'Due Date', 'Priority', 'Status', 'Actions'].map(h => (
                    <th key={h} className="p-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan={7} className="p-6 text-center text-gray-400 dark:text-gray-500">No tasks yet.</td></tr>
                ) : filteredTasks.length === 0 ? (
                  <tr><td colSpan={7} className="p-6 text-center text-gray-400 dark:text-gray-500">No tasks match your search criteria.</td></tr>
                ) : (
                  filteredTasks.map(task => (
                    <tr key={task.id} className="border-t dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={task.is_completed}
                          onChange={() => handleComplete(task)}
                          className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />
                      </td>
                      <td className={`p-3 font-medium ${task.is_completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-slate-900 dark:text-gray-100'}`}>
                        {task.title}
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{task.description || '—'}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400 font-medium">
                        {formatFriendlyDate(task.due_date)}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.is_completed ? 'done' : 'pending']}`}>
                          {task.is_completed ? 'Done' : 'Pending'}
                        </span>
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