'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Admin {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : '';

  const loadAdmins = async () => {
    const res = await api.get('/api/super-admin/admins', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setAdmins(res.data.admins);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const createAdmin = async (e: any) => {
    e.preventDefault();

    await api.post(
      '/api/super-admin/create-admin',
      null,
      {
        params: form,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessage('Admin created successfully');

    setForm({
      full_name: '',
      email: '',
      password: '',
    });

    loadAdmins();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">

      <h1 className="text-3xl font-bold mb-6">
        Manage Admins
      </h1>

      {message && (
        <div className="bg-green-700 p-3 rounded mb-5">
          {message}
        </div>
      )}

      <form
        onSubmit={createAdmin}
        className="bg-slate-800 p-6 rounded-xl mb-10 space-y-4"
      >
        <input
          className="w-full p-3 rounded bg-slate-900"
          placeholder="Full Name"
          value={form.full_name}
          onChange={(e) =>
            setForm({
              ...form,
              full_name: e.target.value,
            })
          }
        />

        <input
          className="w-full p-3 rounded bg-slate-900"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          className="w-full p-3 rounded bg-slate-900"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button className="bg-blue-600 px-6 py-3 rounded">
          Create Admin
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">
        Existing Admins
      </h2>

      <table className="w-full bg-slate-800 rounded-xl overflow-hidden">

        <thead className="bg-slate-700">

          <tr>

            <th className="p-4 text-left">ID</th>

            <th className="p-4 text-left">Name</th>

            <th className="p-4 text-left">Email</th>

            <th className="p-4 text-left">Status</th>

          </tr>

        </thead>

        <tbody>

          {admins.map((admin) => (

            <tr
              key={admin.id}
              className="border-t border-slate-700"
            >

              <td className="p-4">{admin.id}</td>

              <td className="p-4">{admin.full_name}</td>

              <td className="p-4">{admin.email}</td>

              <td className="p-4">

                {admin.is_active ? (

                  <span className="text-green-400">
                    Active
                  </span>

                ) : (

                  <span className="text-red-400">
                    Inactive
                  </span>

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}