'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', thisWeek: 120, lastWeek: 90 },
  { day: 'Tue', thisWeek: 180, lastWeek: 140 },
  { day: 'Wed', thisWeek: 150, lastWeek: 200 },
  { day: 'Thu', thisWeek: 90, lastWeek: 130 },
  { day: 'Fri', thisWeek: 220, lastWeek: 110 },
  { day: 'Sat', thisWeek: 280, lastWeek: 160 },
  { day: 'Sun', thisWeek: 240, lastWeek: 190 },
];

export default function PerformanceChart() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Performance Overview</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Weekly activity across your pipeline
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> This week
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800 dark:bg-slate-400" /> Last week
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="thisWeekGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lastWeekGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              fontSize: '0.75rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          />
          <Area
            type="monotone"
            dataKey="lastWeek"
            stroke="#94a3b8"
            strokeWidth={2}
            fill="url(#lastWeekGradient)"
          />
          <Area
            type="monotone"
            dataKey="thisWeek"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#thisWeekGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
