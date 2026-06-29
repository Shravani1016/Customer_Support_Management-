'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ leads: 0, contacts: 0, companies: 0, deals: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/api/leads/'),
      api.get('/api/contacts/'),
      api.get('/api/companies/'),
      api.get('/api/deals/'),
    ]).then(([leads, contacts, companies, deals]) => {
      setCounts({
        leads: leads.data.length,
        contacts: contacts.data.length,
        companies: companies.data.length,
        deals: deals.data.length,
      });
    });
  }, []);

  const stats = [
    { label: 'Total Leads', value: counts.leads, icon: '🎯', color: 'bg-blue-50 border-blue-200' },
    { label: 'Contacts', value: counts.contacts, icon: '👤', color: 'bg-green-50 border-green-200' },
    { label: 'Companies', value: counts.companies, icon: '🏢', color: 'bg-purple-50 border-purple-200' },
    { label: 'Active Deals', value: counts.deals, icon: '💰', color: 'bg-yellow-50 border-yellow-200' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back, {user?.full_name}</p>

      <div className="grid grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.label} className={`border rounded-xl p-6 ${stat.color}`}>
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}