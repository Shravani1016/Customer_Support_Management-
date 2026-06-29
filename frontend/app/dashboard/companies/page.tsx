'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Company } from '@/types';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', website: '', phone: '' });

  const fetchCompanies = () => api.get('/api/companies/').then(res => setCompanies(res.data));

  useEffect(() => { fetchCompanies(); }, []);

  const handleCreate = async () => {
    await api.post('/api/companies/', form);
    setForm({ name: '', industry: '', website: '', phone: '' });
    setShowForm(false);
    fetchCompanies();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/api/companies/${id}`);
    fetchCompanies();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Companies</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          + Add Company
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">New Company</h2>
          <div className="grid grid-cols-2 gap-4">
            {['name', 'industry', 'website', 'phone'].map(field => (
              <input
                key={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={(form as any)[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Save</button>
            <button onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              {['Name', 'Industry', 'Website', 'Phone', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {companies.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No companies yet.</td></tr>
            ) : (
              companies.map(company => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{company.name}</td>
                  <td className="px-4 py-3 text-gray-500">{company.industry || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{company.website || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{company.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(company.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}