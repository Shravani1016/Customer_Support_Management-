'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Company } from '@/types';
import toast from 'react-hot-toast';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', website: '', phone: '' });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/companies/');
      setCompanies(res.data);
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleCreate = async () => {
    if (!form.name) { toast.error('Company name is required!'); return; }
    if (form.phone && (!/^\d{10}$/.test(form.phone))) { toast.error('Phone must be exactly 10 digits!'); return; }
    try {
      setSaving(true);
      await api.post('/api/companies/', form);
      setForm({ name: '', industry: '', website: '', phone: '' });
      setShowForm(false);
      toast.success('Company created successfully!');
      fetchCompanies();
    } catch {
      toast.error('Failed to create company');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/companies/${id}`);
      toast.success('Company deleted!');
      fetchCompanies();
    } catch {
      toast.error('Failed to delete company');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setIndustryFilter('all');
  };

  const exportCSV = async () => {
    try {
      const res = await api.get('/api/companies/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'companies.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  // Get unique non-empty industries sorted alphabetically
  const uniqueIndustries = Array.from(
    new Set(companies.map(company => company.industry?.trim() || '').filter(Boolean))
  ).sort();

  // Compute filtered companies in real-time
  const filteredCompanies = companies.filter(company => {
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch = !query ||
      company.name.toLowerCase().includes(query) ||
      (company.website && company.website.toLowerCase().includes(query)) ||
      (company.phone && company.phone.toLowerCase().includes(query));

    const companyIndustry = company.industry?.trim() || '';
    const matchesIndustry = industryFilter === 'all' || companyIndustry === industryFilter;

    return matchesSearch && matchesIndustry;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Companies</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg hover:opacity-90 shadow-lg shadow-indigo-500/20 text-sm transition"
          >
            + Add Company
          </button>
          <button
            onClick={exportCSV}
            className="border border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-sm transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-xl p-6 mb-6 shadow-md shadow-gray-200/50 dark:shadow-none">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">New Company</h2>
          <div className="grid grid-cols-2 gap-4">
<input
  placeholder="Company Name *"
  value={form.name}
  onChange={e => setForm({ ...form, name: e.target.value })}
  className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-gray-900"
/>
<input
  placeholder="Industry"
  value={form.industry}
  onChange={e => setForm({ ...form, industry: e.target.value })}
  className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-gray-900"
/>
<input
  placeholder="Website"
  value={form.website}
  onChange={e => setForm({ ...form, website: e.target.value })}
  className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-gray-900"
/>
<input
  placeholder="Phone (10 digits)"
  type="tel"
  maxLength={10}
  value={form.phone}
  onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
  className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-gray-900"
/>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-gray-500 dark:text-gray-400 px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Search and Filters Bar */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-xl p-4 mb-6 shadow-md shadow-gray-200/50 dark:shadow-none flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative w-full md:w-96 shrink-0">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name, website, or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 w-full border dark:border-gray-600 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 hover:bg-gray-100/50 dark:hover:bg-gray-900/70 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 justify-start md:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Industry:</span>
                <select
                  value={industryFilter}
                  onChange={e => setIndustryFilter(e.target.value)}
                  className="h-10 border dark:border-gray-600 rounded-lg px-3 text-sm text-black dark:text-white bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer min-w-32.5 max-w-40"
                >
                  <option value="all">All Industries</option>
                  {uniqueIndustries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {(searchQuery || industryFilter !== 'all') && (
                <button
                  onClick={handleClearFilters}
                  className="h-10 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors px-2 hover:underline cursor-pointer flex items-center"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Filter Stats */}
          <div className="flex justify-between items-center px-1 mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {companies.length === 0
                ? 'No companies available'
                : `Showing ${filteredCompanies.length} of ${companies.length} companies`}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-md shadow-gray-200/50 dark:shadow-none overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-b dark:border-gray-700">
                <tr>
                  {['Name', 'Industry', 'Website', 'Phone', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {companies.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400 dark:text-gray-500">No companies yet.</td></tr>
                ) : filteredCompanies.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400 dark:text-gray-500">No companies match your search criteria.</td></tr>
                ) : (
                  filteredCompanies.map(company => (
                    <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{company.name}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{company.industry || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{company.website || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{company.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(company.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs px-2 py-1 rounded-md transition">Delete</button>
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