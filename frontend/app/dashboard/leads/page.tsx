'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Lead } from '@/types';

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  converted: 'bg-purple-100 text-purple-700',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'new', source: '' });

  const fetchLeads = () => api.get('/api/leads/').then(res => setLeads(res.data));

  useEffect(() => { fetchLeads(); }, []);

  const handleCreate = async () => {
    await api.post('/api/leads/', form);
    setForm({ name: '', email: '', phone: '', status: 'new', source: '' });
    setShowForm(false);
    fetchLeads();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/api/leads/${id}`);
    fetchLeads();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          + Add Lead
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">New Lead</h2>
          <div className="grid grid-cols-2 gap-4">
            {['name', 'email', 'phone', 'source'].map(field => (
              <input
                key={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={(form as any)[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              {['new', 'contacted', 'qualified', 'lost', 'converted'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Save
            </button>
            <button onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2 text-sm hover:text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              {['Name', 'Email', 'Phone', 'Status', 'Source', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No leads yet. Add your first one!</td></tr>
            ) : (
              leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{lead.name}</td>
                  <td className="px-4 py-3 text-gray-500">{lead.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{lead.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{lead.source || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(lead.id)} className="text-red-500 hover:text-red-700 text-xs">
                      Delete
                    </button>
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