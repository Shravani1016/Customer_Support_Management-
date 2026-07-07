'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import PerformanceChart from '@/components/PerformanceChart';
import { Task } from '@/types';
import toast from 'react-hot-toast';
import {
  Target, Users, Building2, DollarSign,
  TrendingUp, ArrowUpRight, Plus,
  Sparkles, BarChart3, ChevronLeft, ChevronRight, Check, Calendar
} from 'lucide-react';

type Counts = { leads: number; contacts: number; companies: number; deals: number };

export default function DashboardPage() {
  const { user } = useAuth();

  const [counts, setCounts] = useState<Counts>({
    leads: 0,
    contacts: 0,
    companies: 0,
    deals: 0,
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const fetchDashboardData = () => {
    Promise.all([
      api.get('/api/leads/'),
      api.get('/api/contacts/'),
      api.get('/api/companies/'),
      api.get('/api/deals/'),
      api.get('/api/tasks'),
    ])
      .then(([leads, contacts, companies, deals, tasksData]) => {
        setCounts({
          leads: leads.data.length,
          contacts: contacts.data.length,
          companies: companies.data.length,
          deals: deals.data.length,
        });
        setTasks(tasksData.data);
      })
      .catch((err) => console.error('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleComplete = async (task: Task) => {
    try {
      await api.put(`/api/tasks/${task.id}`, { is_completed: !task.is_completed });
      toast.success(task.is_completed ? 'Task marked as pending' : 'Task marked as complete');
      fetchDashboardData();
    } catch {
      toast.error('Failed to update task status');
    }
  };

  // Mini-Calendar Helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

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

  const selectedDateKey = formatLocalDate(selectedDate);
  const selectedDayTasks = tasks.filter(
    (t) => t.due_date && formatLocalDate(new Date(t.due_date)) === selectedDateKey
  );

  const stats = [
    {
      label: 'Total Leads',
      value: counts.leads,
      icon: Target,
      href: '/dashboard/leads',
      accent: 'from-indigo-500 to-violet-500',
      ring: 'ring-indigo-100',
      trend: '+12%',
    },
    {
      label: 'Contacts',
      value: counts.contacts,
      icon: Users,
      href: '/dashboard/contacts',
      accent: 'from-teal-500 to-cyan-500',
      ring: 'ring-teal-100',
      trend: '+8%',
    },
    {
      label: 'Companies',
      value: counts.companies,
      icon: Building2,
      href: '/dashboard/companies',
      accent: 'from-fuchsia-500 to-pink-500',
      ring: 'ring-fuchsia-100',
      trend: '+5%',
    },
    {
      label: 'Active Deals',
      value: counts.deals,
      icon: DollarSign,
      href: '/dashboard/deals',
      accent: 'from-orange-500 to-rose-500',
      ring: 'ring-orange-100',
      trend: '+24%',
    },
  ];

  const quickActions = [
    { label: 'Leads', href: '/dashboard/leads', icon: Target, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
    { label: 'Contacts', href: '/dashboard/contacts', icon: Users, color: 'text-teal-600 bg-teal-50 hover:bg-teal-100' },
    { label: 'Companies', href: '/dashboard/companies', icon: Building2, color: 'text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100' },
    { label: 'Deals', href: '/dashboard/deals', icon: DollarSign, color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/40 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              {dateLabel}
            </p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Welcome back,{' '}
              <span className="bg-linear-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {user?.full_name || 'Admin User'}
              </span>{' '}
              👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">Here's what's happening in your ClientFlow today.</p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/dashboard/Calender"
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg shadow-sm transition"
            >
              <Calendar className="w-4 h-4" />
              Full Calendar
            </Link>
            <Link
              href="/dashboard/deals"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition"
            >
              <Plus className="w-4 h-4" />
              New Deal
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                href={s.href}
                className={`group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all ring-1 ${s.ring}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${s.accent} flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    {s.trend}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {loading ? '—' : s.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{s.label}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  <span>Open {s.label.toLowerCase()}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        <PerformanceChart />

        {/* Calendar and Quick Access section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Dashboard Mini-Calendar & Tasks schedule */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col md:flex-row gap-6">
            
            {/* Mini-Calendar Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                  {monthNames[month]} {year}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition text-slate-600 dark:text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition text-slate-600 dark:text-slate-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => <span key={idx}>{d}</span>)}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {/* Empty leading cells */}
                {Array.from({ length: firstDay }).map((_, idx) => (
                  <span key={`empty-${idx}`} />
                ))}

                {/* Days of current month */}
                {days.map((date) => {
                  const dateStr = formatLocalDate(date);
                  const hasTasks = tasks.some(
                    (t) => t.due_date && formatLocalDate(new Date(t.due_date)) === dateStr
                  );
                  const isSelected = isSameDay(date, selectedDate);
                  const isCurrToday = isSameDay(date, today);

                  return (
                    <button
                      key={date.getTime()}
                      onClick={() => setSelectedDate(date)}
                      className={`h-7 w-7 mx-auto rounded-full flex flex-col items-center justify-center relative font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : isCurrToday
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{date.getDate()}</span>
                      {hasTasks && (
                        <span
                          className={`absolute bottom-1 h-1 w-1 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-indigo-500'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date's Tasks list */}
            <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
                  Schedule for {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedDayTasks.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4">No tasks scheduled.</p>
                  ) : (
                    selectedDayTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleComplete(task)}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer transition border border-slate-50 dark:border-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 ${
                          task.is_completed
                            ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 line-through'
                            : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span className="truncate flex-1 mr-2">{task.title}</span>
                        <button className="h-4 w-4 flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 shrink-0">
                          {task.is_completed && <Check className="w-2.5 h-2.5 text-emerald-500" />}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <Link
                  href="/dashboard/Calender"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Manage all tasks
                </Link>
                <Link
                  href="/dashboard/tasks"
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
                >
                  + Add task
                </Link>
              </div>
            </div>

          </div>

          {/* Quick Access */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Access</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">Jump to a section</p>

            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.label}
                    href={a.href}
                    className={`flex flex-col items-start gap-2 p-4 rounded-xl transition ${a.color}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-semibold">{a.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
