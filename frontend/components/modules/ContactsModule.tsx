'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PhoneInput from '@/components/PhoneInput';
import { Contact } from '@/types';
import toast from 'react-hot-toast';
import { usePagination } from '@/lib/usePagination';
import Pagination from '@/components/Pagination';

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

const emptyForm = { first_name: '', last_name: '', email: '', phone: '' };

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/contacts/');
      setContacts(res.data);
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (contact: Contact) => {
    setEditingId(contact.id);
    setForm({
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name) { toast.error('First and last name are required!'); return; }
    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/api/contacts/${editingId}`, form);
        toast.success('Contact updated successfully!');
      } else {
        await api.post('/api/contacts/', form);
        toast.success('Contact created successfully!');
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchContacts();
    } catch (err: any) {
      const message = err?.response?.data?.detail;
      toast.error(typeof message === 'string' ? message : (editingId ? 'Failed to update contact' : 'Failed to create contact'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/contacts/${id}`);
      toast.success('Contact deleted!');
      fetchContacts();
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  const handleToggleActive = async (contact: Contact) => {
    try {
      await api.patch(`/api/contacts/${contact.id}/active`, { is_active: !contact.is_active });
      toast.success(`Marked ${contact.is_active ? 'inactive' : 'active'}`);
      fetchContacts();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const exportCSV = async () => {
    try {
      const res = await api.get('/api/contacts/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contacts.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      contact.first_name.toLowerCase().includes(query) ||
      contact.last_name.toLowerCase().includes(query) ||
      (contact.email && contact.email.toLowerCase().includes(query)) ||
      (contact.phone && contact.phone.toLowerCase().includes(query));

    const matchesActive =
      activeFilter === 'all' ||
      (activeFilter === 'active' && contact.is_active) ||
      (activeFilter === 'inactive' && !contact.is_active);

    return matchesSearch && matchesActive;
  });

  const {
    page, setPage, pageSize, setPageSize,
    totalPages, totalItems, paginatedItems: paginatedContacts, resetPage,
  } = usePagination(filteredContacts, 10);

  useEffect(() => { resetPage(); }, [searchQuery, activeFilter]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Contacts</h1>
        <div className="flex gap-2">
          <button
            onClick={() => (showForm ? setShowForm(false) : openAddForm())}
            className="bg-linear-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg hover:opacity-90 shadow-lg shadow-indigo-500/20 text-sm transition"
          >
            + Add Contact
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
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
            {editingId ? 'Edit Contact' : 'New Contact'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="First Name *"
              value={form.first_name}
              onChange={e => setForm({ ...form, first_name: e.target.value })}
              className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-gray-900"
            />
            <input
              placeholder="Last Name *"
              value={form.last_name}
              onChange={e => setForm({ ...form, last_name: e.target.value })}
              className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-gray-900"
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white dark:bg-gray-900"
            />
            <PhoneInput value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-linear-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="text-gray-500 dark:text-gray-400 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-xl p-4 mb-6 shadow-md shadow-gray-200/50 dark:shadow-none flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative w-full md:w-96 shrink-0">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 w-full border dark:border-gray-600 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 hover:bg-gray-100/50 dark:hover:bg-gray-900/70 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 justify-start md:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Active:</span>
                <select
                  value={activeFilter}
                  onChange={e => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="h-10 border dark:border-gray-600 rounded-lg px-3 text-sm text-black dark:text-white bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {(searchQuery || activeFilter !== 'all') && (
                <button
                  onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                  className="h-10 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors px-2 hover:underline cursor-pointer flex items-center"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-md shadow-gray-200/50 dark:shadow-none overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-b dark:border-gray-700">
                <tr>
                  {['Name', 'Email', 'Phone', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {contacts.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400 dark:text-gray-500">No contacts yet.</td></tr>
                ) : filteredContacts.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400 dark:text-gray-500">No contacts match your search criteria.</td></tr>
                ) : (
                  paginatedContacts.map(contact => {
                    const fullName = `${contact.first_name} ${contact.last_name}`;
                    return (
                      <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${avatarColor(fullName)}`}>
                              {initials(contact.first_name, contact.last_name)}
                            </div>
                            <span className="font-medium text-gray-800 dark:text-gray-100">{fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{contact.email || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{contact.phone || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleActive(contact)}
                              className={`text-xs px-2 py-1 rounded-md transition ${
                                contact.is_active
                                  ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10'
                                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {contact.is_active ? '● Active' : '○ Inactive'}
                            </button>
                            <button
                              onClick={() => openEditForm(contact)}
                              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-xs px-2 py-1 rounded-md transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(contact.id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs px-2 py-1 rounded-md transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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