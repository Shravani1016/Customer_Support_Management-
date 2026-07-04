'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '@/lib/api';

interface Summary {
  total_leads: number;
  total_contacts: number;
  total_companies: number;
  active_deals: number;
  won_deals: number;
  total_revenue: number;
  pipeline_value: number;
  win_rate: number;
}

interface LeadStatus {
  status: string;
  count: number;
}

interface DealStage {
  stage: string;
  count: number;
  value: number;
}

interface RevenueTrend {
  month: string;
  value: number;
}

// Brand palette (indigo/violet family), keeping green/red for genuinely
// good/bad outcomes (converted, lost, closed_won, closed_lost) so the
// semantic meaning established elsewhere in the app (Tasks priority, etc.)
// stays consistent.
const LEAD_COLORS: Record<string, string> = {
  new: '#818cf8',        // indigo-400
  contacted: '#fbbf24',  // amber-400
  qualified: '#8b5cf6',  // violet-500
  lost: '#f87171',       // red-400 (semantic: bad outcome)
  converted: '#34d399',  // emerald-400 (semantic: good outcome)
};

const STAGE_COLORS: Record<string, string> = {
  prospecting: '#94a3b8',  // slate-400 (neutral, early stage)
  proposal: '#818cf8',     // indigo-400
  negotiation: '#fbbf24',  // amber-400
  closed_won: '#34d399',   // emerald-400 (semantic: good outcome)
  closed_lost: '#f87171',  // red-400 (semantic: bad outcome)
};

export default function ReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [leadsByStatus, setLeadsByStatus] = useState<LeadStatus[]>([]);
  const [dealsByStage, setDealsByStage] = useState<DealStage[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, l, d, r] = await Promise.all([
          api.get('/api/reports/summary'),
          api.get('/api/reports/leads-by-status'),
          api.get('/api/reports/deals-by-stage'),
          api.get('/api/reports/revenue-trend'),
        ]);

        setSummary(s.data);
        setLeadsByStatus(l.data);
        setDealsByStage(d.data);
        setRevenueTrend(r.data);
      } catch (err) {
        console.error('Failed to fetch reports', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchAll();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading reports...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Reports & Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-md shadow-gray-200/50 dark:shadow-none p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ${summary?.total_revenue?.toLocaleString() ?? 0}
              </p>
            </div>
            <div className="rounded-lg p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m9-8a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-md shadow-gray-200/50 dark:shadow-none p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pipeline Value</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                ${summary?.pipeline_value?.toLocaleString() ?? 0}
              </p>
            </div>
            <div className="rounded-lg p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-md shadow-gray-200/50 dark:shadow-none p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 to-violet-600" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-1">{summary?.win_rate ?? 0}%</p>
            </div>
            <div className="rounded-lg p-2 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-md shadow-gray-200/50 dark:shadow-none p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-pink-600" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Active Deals</p>
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400 mt-1">{summary?.active_deals ?? 0}</p>
            </div>
            <div className="rounded-lg p-2 bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-md shadow-gray-200/50 dark:shadow-none p-6">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Leads by Status</h2>

          {leadsByStatus.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-center py-12">No lead data yet.</p>
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={leadsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {leadsByStatus.map((entry, index) => (
                      <Cell key={`lead-${index}`} fill={LEAD_COLORS[entry.status] || '#94a3b8'} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[100px] left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {leadsByStatus.reduce((sum, l) => sum + l.count, 0)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">total leads</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-md shadow-gray-200/50 dark:shadow-none p-6">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Deals by Stage</h2>

          {dealsByStage.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-center py-12">No deal data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dealsByStage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {dealsByStage.map((entry, index) => (
                    <Cell key={`deal-${index}`} fill={STAGE_COLORS[entry.stage] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-md shadow-gray-200/50 dark:shadow-none p-6">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Revenue Trend (Closed Won)</h2>

        {revenueTrend.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-center py-12">No closed deals yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#7c3aed"
                strokeWidth={3}
                fill="url(#revenueFill)"
                dot={{ r: 5, fill: '#7c3aed' }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}