'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ManageEmployeesPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'sales_rep',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('access_token');

      await api.post('/api/super-admin/create-employee', null, {
        params: form,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage('Employee created successfully');
      setForm({ email: '', full_name: '', password: '', role: 'sales_rep' });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create employee');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <button onClick={() => router.push('/super-admin/dashboard')} className="mb-6 text-blue-400">
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Create Employee</h1>

      {message && <div className="bg-green-800 p-3 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-800 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={createEmployee} className="bg-slate-800 p-6 rounded-xl max-w-md space-y-4">
        <input
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
          placeholder="Full Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />

        <input
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <select
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="sales_rep">Sales Rep</option>
          <option value="manager">Manager</option>
        </select>

        <button className="w-full bg-blue-600 p-3 rounded hover:bg-blue-700">
          Create Employee
        </button>
      </form>
    </div>
  );
}