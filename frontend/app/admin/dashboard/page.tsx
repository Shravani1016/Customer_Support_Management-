'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser || storedUser === 'undefined') {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role !== 'admin' && parsedUser.role !== 'super_admin') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const logout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome, {user.full_name}</p>
        </div>

        <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => router.push('/admin/employees')} className="bg-slate-800 p-5 rounded-xl text-left hover:bg-slate-700">
          Manage Employees
        </button>

        <button onClick={() => router.push('/admin/leads')} className="bg-slate-800 p-5 rounded-xl text-left hover:bg-slate-700">
          Leads
        </button>

        <button onClick={() => router.push('/admin/deals')} className="bg-slate-800 p-5 rounded-xl text-left hover:bg-slate-700">
          Deals
        </button>

        <button onClick={() => router.push('/admin/tasks')} className="bg-slate-800 p-5 rounded-xl text-left hover:bg-slate-700">
          Tasks
        </button>

        <button onClick={() => router.push('/admin/reports')} className="bg-slate-800 p-5 rounded-xl text-left hover:bg-slate-700">
          Reports
        </button>
      </div>
    </div>
  );
}