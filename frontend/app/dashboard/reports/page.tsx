'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
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

const LEAD_COLORS: Record<string, string> = {
  new: '#60a5fa',
  contacted: '#fbbf24',
  qualified: '#a78bfa',
  lost: '#f87171',
  converted: '#34d399',
};

const STAGE_COLORS: Record<string, string> = {
  prospecting: '#94a3b8',
  proposal: '#60a5fa',
  negotiation: '#fbbf24',
  closed_won: '#34d399',
  closed_lost: '#f87171',
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
    return <div className="text-center py-12 text-gray-400">Loading reports...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports & Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            ${summary?.total_revenue?.toLocaleString() ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <p className="text-gray-500 text-sm">Pipeline Value</p>
          <p className="text-2xl font-bold text-blue-600">
            ${summary?.pipeline_value?.toLocaleString() ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <p className="text-gray-500 text-sm">Win Rate</p>
          <p className="text-2xl font-bold text-purple-600">{summary?.win_rate ?? 0}%</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <p className="text-gray-500 text-sm">Active Deals</p>
          <p className="text-2xl font-bold text-orange-600">{summary?.active_deals ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Leads by Status</h2>

          {leadsByStatus.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No lead data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={leadsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  
                >
                  {leadsByStatus.map((entry, index) => (
                    <Cell key={`lead-${index}`} fill={LEAD_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Deals by Stage</h2>

          {dealsByStage.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No deal data yet.</p>
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

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Revenue Trend (Closed Won)</h2>

        {revenueTrend.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No closed deals yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}