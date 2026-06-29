'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Deal } from '@/types';

const stageColors: Record<string, string> = {
  prospecting: 'bg-blue-100 text-blue-700',
  proposal: 'bg-yellow-100 text-yellow-700',
  negotiation: 'bg-orange-100 text-orange-700',
  closed_won: 'bg-green-100 text-green-700',
  closed_lost: 'bg-red-100 text-red-700',
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', value: '', stage: 'prospecting' });

  const fetchDeals = () => api.get('/api/deals/').then(res => setDeals(res.data));

  useEffect(() => { fetchDeals(); }, []);

  const handleCreate = async () => {
    await api.post('/api/deals/', { ...form, value: parseFloat(form.value) || 0 });
    setForm({ title: '', value: '', stage: 'prospecting' });
    setShowForm(false);
    fetchDeals();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/api/deals/${id}`);
    fetchDeals();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Deals</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          + Add Deal
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">New Deal</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Value ($)"
              value={form.value}
              onChange={e => setForm({ ...form, value: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={form.stage}
              onChange={e => setForm({ ...form, stage: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              {['prospecting', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
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
              {['Title', 'Value', 'Stage', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {deals.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">No deals yet.</td></tr>
            ) : (
              deals.map(deal => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{deal.title}</td>
                  <td className="px-4 py-3 text-gray-500">${deal.value.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stageColors[deal.stage]}`}>
                      {deal.stage.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(deal.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
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