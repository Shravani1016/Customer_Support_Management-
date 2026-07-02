'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Contact } from '@/types';
import toast from 'react-hot-toast';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '' });

  // Search state
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

  const handleCreate = async () => {
    if (!form.first_name || !form.last_name) { toast.error('First and last name are required!'); return; }
    if (form.phone && (!/^\d{10}$/.test(form.phone))) { toast.error('Phone must be exactly 10 digits!'); return; }
    try {
      setSaving(true);
      await api.post('/api/contacts/', form);
      setForm({ first_name: '', last_name: '', email: '', phone: '' });
      setShowForm(false);
      toast.success('Contact created successfully!');
      fetchContacts();
    } catch {
      toast.error('Failed to create contact');
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

  // Real-time filtering logic
  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase().trim();
    return !query ||
      contact.first_name.toLowerCase().includes(query) ||
      contact.last_name.toLowerCase().includes(query) ||
      (contact.email && contact.email.toLowerCase().includes(query)) ||
      (contact.phone && contact.phone.toLowerCase().includes(query));
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          + Add Contact
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">New Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            {['first_name', 'last_name', 'email', 'phone'].map(field => (
              <input
                key={field}
                placeholder={field.replace('_', ' ')}
                value={(form as any)[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            ))}
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
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 w-full border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100/50 transition-colors"
              />
            </div>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="h-10 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-2 hover:underline cursor-pointer flex items-center justify-start md:justify-end"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Filter Stats */}
          <div className="flex justify-between items-center px-1 mb-2">
            <span className="text-xs text-gray-500 font-medium">
              {contacts.length === 0
                ? 'No contacts available'
                : `Showing ${filteredContacts.length} of ${contacts.length} contacts`}
            </span>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  {['Name', 'Email', 'Phone', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No contacts yet.</td></tr>
                ) : filteredContacts.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No contacts match your search criteria.</td></tr>
                ) : (
                  filteredContacts.map(contact => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{contact.first_name} {contact.last_name}</td>
                      <td className="px-4 py-3 text-gray-500">{contact.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{contact.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(contact.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
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