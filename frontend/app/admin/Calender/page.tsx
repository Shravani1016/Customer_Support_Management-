'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Task } from '@/types';
import { Activity, ACTIVITY_ICONS } from '@/types/activity';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Check } from 'lucide-react';

const priorityColors: Record<string, { bg: string; text: string; dot: string }> = {
  low: {
    bg: 'bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  medium: {
    bg: 'bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  high: {
    bg: 'bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
};

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
    is_completed: false,
  });
  const [saving, setSaving] = useState(false);

  const fetchTasksAndActivities = async () => {
    try {
      setLoading(true);
      const [tasksRes, activitiesRes] = await Promise.all([
        api.get('/api/tasks'),
        api.get('/api/activities'),
      ]);
      setTasks(tasksRes.data);
      setActivities(activitiesRes.data);
    } catch {
      toast.error('Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndActivities();
  }, []);

  // Helper values for generating calendar
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month (0: Sunday, 1: Monday, ...)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Number of days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Generate days array
  const calendarCells: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

  // Previous month's trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
    calendarCells.push({
      date: prevDate,
      isCurrentMonth: false,
      key: `prev-${prevDate.getTime()}`,
    });
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    calendarCells.push({
      date,
      isCurrentMonth: true,
      key: `curr-${date.getTime()}`,
    });
  }

  // Next month's leading days to complete the 6-row grid (42 cells)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(year, month + 1, i);
    calendarCells.push({
      date: nextDate,
      isCurrentMonth: false,
      key: `next-${nextDate.getTime()}`,
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Check if dates are the same (ignores time)
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const formatLocalDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const openCreateModal = (date: Date) => {
    setSelectedTask(null);
    setForm({
      title: '',
      description: '',
      priority: 'medium',
      due_date: formatLocalDate(date),
      is_completed: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? formatLocalDate(new Date(task.due_date)) : '',
      is_completed: task.is_completed,
    });
    setModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!form.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        is_completed: form.is_completed,
      };

      if (selectedTask) {
        // Edit Mode
        await api.put(`/api/tasks/${selectedTask.id}`, payload);
        toast.success('Task updated successfully!');
      } else {
        // Create Mode
        await api.post('/api/tasks', payload);
        toast.success('Task created successfully!');
      }

      setModalOpen(false);
      fetchTasksAndActivities();
    } catch {
      toast.error('Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (!confirm(`Delete task "${selectedTask.title}"?`)) return;

    try {
      setSaving(true);
      await api.delete(`/api/tasks/${selectedTask.id}`);
      toast.success('Task deleted successfully!');
      setModalOpen(false);
      fetchTasksAndActivities();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/api/tasks/${task.id}`, { is_completed: !task.is_completed });
      toast.success(task.is_completed ? 'Task marked as pending' : 'Task marked as complete');
      fetchTasksAndActivities();
    } catch {
      toast.error('Failed to update task status');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Visualize and manage your CRM task deadlines efficiently</p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800/50">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition text-slate-600 dark:text-slate-300"
              title="Previous Month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-semibold hover:bg-white dark:hover:bg-slate-700 rounded-md transition text-slate-700 dark:text-slate-200"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition text-slate-600 dark:text-slate-300"
              title="Next Month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={() => openCreateModal(new Date())}
            className="flex items-center gap-1.5 bg-linear-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 shadow-lg shadow-indigo-500/20 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Main Month Banner */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {monthNames[month]} <span className="text-slate-400 font-normal">{year}</span>
        </h2>
      </div>

      {/* Loading Spin */}
      {loading ? (
        <div className="flex justify-center items-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl dark:shadow-none">
          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Monthly Calendar Cells Grid */}
          <div className="grid grid-cols-7 auto-rows-30 divide-x divide-y divide-slate-100 dark:divide-slate-800 bg-slate-100 dark:bg-slate-800">
            {calendarCells.map(({ date, isCurrentMonth }) => {
              const dateKey = formatLocalDate(date);
              const dayTasks = tasks.filter((t) => t.due_date && formatLocalDate(new Date(t.due_date)) === dateKey);
              const dayActivities = activities.filter((a) => a.created_at && formatLocalDate(new Date(a.created_at)) === dateKey);
              const isToday = isSameDay(date, new Date());

              return (
                <div
                  key={date.getTime()}
                  onClick={() => openCreateModal(date)}
                  className={`bg-white dark:bg-slate-900 p-2 flex flex-col justify-between group relative transition hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer ${
                    !isCurrentMonth ? 'opacity-40' : ''
                  }`}
                >
                  {/* Day Number Label */}
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-semibold h-6 w-6 flex items-center justify-center rounded-full transition ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {/* Quick Add Plus Icon on Hover */}
                    <span className="opacity-0 group-hover:opacity-100 text-indigo-500 dark:text-indigo-400 p-0.5 rounded transition">
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  {/* Tasks & Activities Container */}
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {dayTasks.map((task) => {
                      const priorityStyle = priorityColors[task.priority] || priorityColors.medium;
                      return (
                        <div
                          key={task.id}
                          onClick={(e) => openEditModal(task, e)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition select-none truncate ${
                            task.is_completed
                              ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 line-through'
                              : `${priorityStyle.bg} ${priorityStyle.text}`
                          }`}
                          title={`[Task] ${task.title}${task.description ? ` - ${task.description}` : ''}`}
                        >
                          {/* Toggle Completion directly */}
                          <button
                            onClick={(e) => handleToggleComplete(task, e)}
                            className="shrink-0 cursor-pointer rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700/50"
                          >
                            {task.is_completed ? (
                              <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <span className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`} />
                            )}
                          </button>
                          <span className="truncate flex-1">{task.title}</span>
                        </div>
                      );
                    })}

                    {dayActivities.map((activity) => {
                      const icon = ACTIVITY_ICONS[activity.type] || '📝';
                      return (
                        <div
                          key={`act-${activity.id}`}
                          className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 select-none truncate"
                          title={`[Activity] ${activity.type}: ${activity.note || ''}`}
                        >
                          <span className="shrink-0">{icon}</span>
                          <span className="truncate flex-1">{activity.note || activity.type}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Creation & Modification Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {selectedTask ? 'Task Details' : 'Create New Task'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Add details, links, or notes..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full border dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full border dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              {selectedTask && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="modalCompleted"
                    checked={form.is_completed}
                    onChange={(e) => setForm({ ...form, is_completed: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="modalCompleted"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                  >
                    Mark this task as completed
                  </label>
                </div>
              )}
            </div>

            {/* Modal Footer actions */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-2">
              {selectedTask ? (
                <button
                  onClick={handleDeleteTask}
                  disabled={saving}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTask}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
