'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import PerformanceChart from '@/components/PerformanceChart';
import {
  Target, Users, Building2, DollarSign,
  TrendingUp, ArrowUpRight, Plus,
  Sparkles, BarChart3,
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
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    Promise.all([
      api.get('/api/leads/'),
      api.get('/api/contacts/'),
      api.get('/api/companies/'),
      api.get('/api/deals/'),
    ])
      .then(([leads, contacts, companies, deals]) => {
        setCounts({
          leads: leads.data.length,
          contacts: contacts.data.length,
          companies: companies.data.length,
          deals: deals.data.length,
        });
      })
      .catch((err) => console.error('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

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

  const tips = [
    {
      title: 'Convert leads faster',
      desc: 'Move qualified leads into deals in one click from the Leads page.',
      color: 'bg-indigo-50 text-indigo-600',
      icon: Target,
    },
    {
      title: 'Group by company',
      desc: 'Link contacts to companies to see every touchpoint in one place.',
      color: 'bg-fuchsia-50 text-fuchsia-600',
      icon: Building2,
    },
    {
      title: 'Track daily tasks',
      desc: 'Add due dates so tasks show up automatically on your dashboard.',
      color: 'bg-teal-50 text-teal-600',
      icon: Users,
    },
    {
      title: 'Close more deals',
      desc: 'Update deal stages regularly to keep your pipeline accurate.',
      color: 'bg-orange-50 text-orange-600',
      icon: DollarSign,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              {dateLabel}
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {user?.full_name || 'Admin User'}
              </span>{' '}
              👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">Here's what's happening in your ClientFlow today.</p>
          </div>

          <Link
            href="/dashboard/deals"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition"
          >
            <Plus className="w-4 h-4" />
            New Deal
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                href={s.href}
                className={`group relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all ring-1 ${s.ring}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    {s.trend}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">
                    {loading ? '—' : s.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{s.label}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-indigo-600 transition">
                  <span>Open {s.label.toLowerCase()}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        <PerformanceChart />

        {/* Quick Access + Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Access */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900">Quick Access</h2>
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

          {/* Tips & Shortcuts — fully static */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Tips & Shortcuts</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">Get more out of ClientFlow CRM</p>
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                Pro tips
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tips.map((tip) => {
                const Icon = tip.icon;
                return (
                  <div
                    key={tip.title}
                    className="flex gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white dark:bg-slate-800"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tip.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{tip.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Ready to grow your pipeline?</p>
                <p className="text-xs text-indigo-100 mt-0.5">Add a new deal and start tracking today.</p>
              </div>
              <Link
                href="/dashboard/deals"
                className="text-xs font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg transition whitespace-nowrap"
              >
                Get started →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
