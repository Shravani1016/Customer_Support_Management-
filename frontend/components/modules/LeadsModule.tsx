'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PhoneInput from '@/components/PhoneInput';
import { Lead } from '@/types';
import toast from 'react-hot-toast';
import { usePagination } from '@/lib/usePagination';
import Pagination from '@/components/Pagination';

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  contacted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  qualified: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  converted: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
};

interface ConvertResponse {
  lead_id: number;
  contact_id: number;
  contact_created: boolean;
  company_id: number | null;
  company_created: boolean;
  deal_id: number;
}

const emptyForm = { name: '', email: '', phone: '', status: 'new', source: '', company_name: '' };

export default function LeadsModule() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

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

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (lead: Lead) => {
    setEditingId(lead.id);
    setForm({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      status: lead.status || 'new',
      source: lead.source || '',
      company_name: lead.company_name || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required!'); return; }
    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/api/leads/${editingId}`, form);
        toast.success('Lead updated successfully!');
      } else {
        await api.post('/api/leads/', form);
        toast.success('Lead created successfully!');
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchLeads();
    } catch {
      toast.error(editingId ? 'Failed to update lead' : 'Failed to create lead');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (lead: Lead) => {
    try {
      await api.patch(`/api/leads/${lead.id}/active`, { is_active: !lead.is_active });
      toast.success(`Marked ${lead.is_active ? 'inactive' : 'active'}`);
      fetchLeads();
    } catch {
      toast.error('Failed to update status');
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

  const handleConvert = async (lead: Lead) => {
    if (!confirm(`Convert "${lead.name}" into a Contact, Company, and Deal?`)) return;
    try {
      setConverting(lead.id);
      const res = await api.post<ConvertResponse>(`/api/leads/${lead.id}/convert`);
      const { contact_created, company_created, company_id } = res.data;

      const parts: string[] = [];
      parts.push(contact_created ? 'new contact created' : 'existing contact linked');
      if (company_id) {
        parts.push(company_created ? 'new company created' : 'existing company linked');
      }
      parts.push('new deal created');

      toast.success(`Lead converted — ${parts.join(', ')}!`);
      fetchLeads();
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Failed to convert lead';
      toast.error(message);
    } finally {
      setConverting(null);
    }
  };

  const exportCSV = async () => {
    try {
      const res = await api.get('/api/leads/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSourceFilter('all');
    setActiveFilter('all');
  };

  const uniqueSources = Array.from(
    new Set(leads.map(lead => lead.source?.trim() || '').filter(Boolean))
  ).sort();

  const filteredLeads = leads.filter((lead) => {
  const query = searchQuery.toLowerCase().trim();

  const matchesSearch =
    !query ||
    lead.name.toLowerCase().includes(query) ||
    (lead.email && lead.email.toLowerCase().includes(query)) ||
    (lead.phone && lead.phone.toLowerCase().includes(query)) ||
    (lead.source && lead.source.toLowerCase().includes(query));

  const matchesStatus =
    statusFilter === 'all' || lead.status === statusFilter;

  const leadSource = lead.source?.trim() || '';
  const matchesSource =
    sourceFilter === 'all' || leadSource === sourceFilter;

  const matchesActive =
    activeFilter === 'all' ||
    (activeFilter === 'active' && lead.is_active) ||
    (activeFilter === 'inactive' && !lead.is_active);

  return (
    matchesSearch &&
    matchesStatus &&
    matchesSource &&
    matchesActive
  );
});

const {
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  totalItems,
  paginatedItems: paginatedLeads,
  resetPage,
} = usePagination(filteredLeads, 10);

useEffect(() => {
  resetPage();
}, [searchQuery, statusFilter, sourceFilter, activeFilter]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Leads</h1>
        <div className="flex gap-2">
          <button
            onClick={() => (showForm ? setShowForm(false) : openAddForm())}
            className="bg-linear-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition"
          >
            + Add Lead
          </button>
          <button
            onClick={exportCSV}
            className="border border-indigo-500 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-sm transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700/50 rounded-xl p-6 mb-6 shadow-md shadow-gray-200/50 dark:shadow-none">
          <h2 className="font-semibold text-gray-700 dark:text-slate-200 mb-4">
            {editingId ? 'Edit Lead' : 'New Lead'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Name *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="border dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-slate-800"
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="border dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-slate-800"
            />
            <PhoneInput value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
            <input
              placeholder="Source"
              value={form.source}
              onChange={e => setForm({ ...form, source: e.target.value })}
              className="border dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-slate-800"
            />
            <input
              placeholder="Company Name (optional)"
              value={form.company_name}
              onChange={e => setForm({ ...form, company_name: e.target.value })}
              className="border dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-slate-800"
            />
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="border dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-black dark:text-white dark:bg-slate-800"
            >
              {['new', 'contacted', 'qualified', 'converted'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-linear-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="text-gray-500 dark:text-slate-400 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700/50 rounded-xl p-4 mb-6 shadow-md shadow-gray-200/50 dark:shadow-none flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
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
                className="pl-10 pr-4 h-10 w-full border dark:border-slate-600 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100/50 dark:hover:bg-slate-800/70 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 justify-start md:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="h-10 border dark:border-slate-600 rounded-lg px-3 text-sm text-black dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer min-w-32.5"
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
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Source:</span>
                <select
                  value={sourceFilter}
                  onChange={e => setSourceFilter(e.target.value)}
                  className="h-10 border dark:border-slate-600 rounded-lg px-3 text-sm text-black dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer min-w-32.5 max-w-40"
                >
                  <option value="all">All Sources</option>
                  {uniqueSources.map(source => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Active:</span>
                <select
                  value={activeFilter}
                  onChange={e => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="h-10 border dark:border-slate-600 rounded-lg px-3 text-sm text-black dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {(searchQuery || statusFilter !== 'all' || sourceFilter !== 'all' || activeFilter !== 'all') && (
                <button
                  onClick={handleClearFilters}
                  className="h-10 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors px-2 hover:underline cursor-pointer flex items-center"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-md shadow-gray-200/50 dark:shadow-none overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-b dark:border-slate-700">
                <tr>
                  {['Name', 'Email', 'Phone', 'Status', 'Source', 'Company'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {leads.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400 dark:text-slate-500">No leads yet. Add your first one!</td></tr>
                ) : filteredLeads.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400 dark:text-slate-500">No leads match your search criteria.</td></tr>
                ) : (
                  paginatedLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-slate-200">{lead.name}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{lead.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{lead.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{lead.source || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{lead.company_name || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleConvert(lead)}
                            disabled={converting === lead.id}
                            className={`text-xs px-2 py-1 rounded-md transition font-medium whitespace-nowrap disabled:opacity-50 ${
                              lead.status === 'qualified'
                                ? 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                                : 'invisible pointer-events-none'
                            }`}
                          >
                            {converting === lead.id ? 'Converting...' : 'Convert Lead'}
                          </button>
                          <button
                            onClick={() => openEditForm(lead)}
                            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-xs px-2 py-1 rounded-md transition whitespace-nowrap"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs px-2 py-1 rounded-md transition whitespace-nowrap"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleToggleActive(lead)}
                            className={`text-xs px-2 py-1 rounded-md transition whitespace-nowrap ${
                              lead.is_active
                                ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10'
                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {lead.is_active ? '● Active' : '○ Inactive'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}