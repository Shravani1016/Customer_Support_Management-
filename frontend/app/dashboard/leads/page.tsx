'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Lead } from '@/types';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'new', source: '' });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/leads/');
      setLeads(res.data);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleCreate = async () => {
    if (!form.name) { toast.error('Name is required!'); return; }
    if (form.phone && (!/^\d{10}$/.test(form.phone))) { toast.error('Phone must be exactly 10 digits!'); return; }
    try {
      setSaving(true);
      await api.post('/api/leads/', form);
      setForm({ name: '', email: '', phone: '', status: 'new', source: '' });
      setShowForm(false);
      toast.success('Lead created successfully!');
      fetchLeads();
    } catch {
      toast.error('Failed to create lead');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/leads/${id}`);
      toast.success('Lead deleted!');
      fetchLeads();
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSourceFilter('all');
  };

  // Get all unique, non-empty sources present in the leads list for the source filter dropdown
  const uniqueSources = Array.from(
    new Set(leads.map(lead => lead.source?.trim() || '').filter(Boolean))
  ).sort();

  // Compute filtered leads in real-time
  const filteredLeads = leads.filter(lead => {
    const query = searchQuery.toLowerCase().trim();

    // Check if query matches Name, Email, Phone, or Source
    const matchesSearch = !query ||
      lead.name.toLowerCase().includes(query) ||
      (lead.email && lead.email.toLowerCase().includes(query)) ||
      (lead.phone && lead.phone.toLowerCase().includes(query)) ||
      (lead.source && lead.source.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    // Normalise source values when matching
    const leadSource = lead.source?.trim() || '';
    const matchesSource = sourceFilter === 'all' || leadSource === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
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
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            ))}
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm text-black"
            >
              {['new', 'contacted', 'qualified', 'lost', 'converted'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Search and Filters Bar */}
          <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative w-full md:w-96 shrink-0">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name, email, phone, or source..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 w-full border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100/50 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 justify-start md:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="h-10 border rounded-lg px-3 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-w-32.5"
                >
                  <option value="all">All Statuses</option>
                  {Object.keys(statusColors).map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Source:</span>
                <select
                  value={sourceFilter}
                  onChange={e => setSourceFilter(e.target.value)}
                  className="h-10 border rounded-lg px-3 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-w-32.5 max-w-40"
                >
                  <option value="all">All Sources</option>
                  {uniqueSources.map(source => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              {(searchQuery || statusFilter !== 'all' || sourceFilter !== 'all') && (
                <button
                  onClick={handleClearFilters}
                  className="h-10 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-2 hover:underline cursor-pointer flex items-center"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Filter Stats */}
          <div className="flex justify-between items-center px-1 mb-2">
            <span className="text-xs text-gray-500 font-medium">
              {leads.length === 0
                ? 'No leads available'
                : `Showing ${filteredLeads.length} of ${leads.length} leads`}
            </span>
          </div>

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
                ) : filteredLeads.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No leads match your search criteria.</td></tr>
                ) : (
                  filteredLeads.map(lead => (
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
        </>
      )}
    </div>
  );
}