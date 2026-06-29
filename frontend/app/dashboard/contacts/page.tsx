'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Contact } from '@/types';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '' });

  const fetchContacts = () => api.get('/api/contacts/').then(res => setContacts(res.data));

  useEffect(() => { fetchContacts(); }, []);

  const handleCreate = async () => {
    await api.post('/api/contacts/', form);
    setForm({ first_name: '', last_name: '', email: '', phone: '' });
    setShowForm(false);
    fetchContacts();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/api/contacts/${id}`);
    fetchContacts();
  };

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
              {['Name', 'Email', 'Phone', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">No contacts yet.</td></tr>
            ) : (
              contacts.map(contact => (
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
    </div>
  );
}