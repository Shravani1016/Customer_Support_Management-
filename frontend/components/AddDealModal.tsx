'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Deal } from '@/types/deal';
import { getErrorMessage } from '@/lib/errorMessage';

interface Props {
  onClose: () => void;
  onSaved: () => void;
  deal?: Deal | null;
}

export default function AddDealModal({ onClose, onSaved, deal }: Props) {
  const isEditing = !!deal;

  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('prospecting');
  const [closeDate, setCloseDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deal) {
      setTitle(deal.title || '');
      setValue(deal.value ? String(deal.value) : '');
      setStage(deal.stage || 'prospecting');
      setCloseDate(deal.expected_close_date ? deal.expected_close_date.slice(0, 10) : '');
    } else {
      setTitle('');
      setValue('');
      setStage('prospecting');
      setCloseDate('');
    }
  }, [deal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { toast.error('Deal title is required!'); return; }
    setLoading(true);
    try {
      const payload = {
        title,
        value: parseFloat(value) || 0,
        stage,
        expected_close_date: closeDate || null,
      };

      if (isEditing && deal) {
        await api.put(`/api/deals/${deal.id}`, payload);
        toast.success('Deal updated successfully!');
      } else {
        await api.post('/api/deals/', payload);
        toast.success('Deal created successfully!');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(getErrorMessage(err, isEditing ? 'Failed to update deal' : 'Failed to create deal'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Deal' : 'Add New Deal'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEditing ? 'Update the details below' : 'Fill in the details below'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Deal Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
              placeholder="e.g. Enterprise Contract"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Value ($)
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Stage
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="prospecting">🔵 Prospecting</option>
              <option value="proposal">🟡 Proposal</option>
              <option value="negotiation">🟠 Negotiation</option>
              <option value="closed_won">🟢 Closed Won</option>
              <option value="closed_lost">🔴 Closed Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Expected Close Date
            </label>
            <input
              type="date"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition shadow-lg shadow-indigo-500/30"
            >
              {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Deal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}