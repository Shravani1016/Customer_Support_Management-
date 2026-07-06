'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser || storedUser === 'undefined') {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role !== 'super_admin') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="bg-slate-950 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          <p className="text-sm text-gray-300">Welcome, {user.full_name}</p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
        >
          Logout
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => router.push('/super-admin/admins')}
          className="bg-slate-800 rounded-xl shadow p-5 text-left hover:bg-slate-700"
        >
          <h2 className="font-semibold text-xl">Manage Admins</h2>
          <p className="text-sm text-gray-400 mt-2">
            Create, update, deactivate organization admins.
          </p>
        </button>

        <button
          onClick={() => router.push('/super-admin/employees')}
          className="bg-slate-800 rounded-xl shadow p-5 text-left hover:bg-slate-700"
        >
          <h2 className="font-semibold text-xl">Manage Employees</h2>
          <p className="text-sm text-gray-400 mt-2">
            Create managers and sales employees.
          </p>
        </button>

        <button className="bg-slate-800 rounded-xl shadow p-5 text-left hover:bg-slate-700">
          <h2 className="font-semibold text-xl">System Settings</h2>
          <p className="text-sm text-gray-400 mt-2">
            Configure roles, permissions, and organization settings.
          </p>
        </button>
      </div>
    </div>
  );
}