'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import api from '@/lib/api';
import { Deal, DealDetail, STAGES } from '@/types/deal';
import KanbanColumn from '@/components/KanbanColumn';
import DealCard from '@/components/DealCard';
import AddDealModal from '@/components/AddDealModal';
import toast from 'react-hot-toast';

type ViewMode = 'pipeline' | 'table';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealDetails, setDealDetails] = useState<DealDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [view, setView] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/deals/');
      setDeals(res.data);
    } catch {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const fetchDealDetails = async () => {
    try {
      const res = await api.get('/api/deals/detail');
      setDealDetails(res.data);
    } catch {
      toast.error('Failed to load deal details');
    }
  };

  useEffect(() => {
    fetchDeals();
    fetchDealDetails();
  }, []);

  const exportCSV = async () => {
    try {
      const res = await api.get('/api/deals/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'deals.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const getDealsByStage = (stageId: string) =>
    deals.filter((d) => d.stage === stageId);

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const activeDealItem = deals.find((d) => d.id === activeId);
    if (!activeDealItem) return;

    const overStage = STAGES.find((s) => s.id === overId);
    if (overStage && activeDealItem.stage !== overStage.id) {
      setDeals((prev) =>
        prev.map((d) =>
          d.id === activeId ? { ...d, stage: overStage.id as Deal['stage'] } : d
        )
      );
    } else {
      const overDeal = deals.find((d) => d.id === overId);
      if (overDeal && activeDealItem.stage !== overDeal.stage) {
        setDeals((prev) =>
          prev.map((d) =>
            d.id === activeId ? { ...d, stage: overDeal.stage } : d
          )
        );
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const activeId = active.id as number;
    const deal = deals.find((d) => d.id === activeId);
    if (!deal) return;

    try {
      await api.patch(`/api/deals/${activeId}/stage`, { stage: deal.stage });
    } catch {
      toast.error('Failed to update deal stage');
      fetchDeals();
    }
  };

  const filteredDealDetails = dealDetails.filter((deal) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      deal.title.toLowerCase().includes(query) ||
      (deal.contact?.company_name?.toLowerCase().includes(query)) ||
      (deal.contact && `${deal.contact.first_name} ${deal.contact.last_name}`.toLowerCase().includes(query)) ||
      (deal.contact?.email?.toLowerCase().includes(query))
    );
  });
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const wonDeals = deals.filter((d) => d.stage === 'closed_won');
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  const stageLabel = (stage: string) =>
    STAGES.find((s) => s.id === stage)?.label || stage;

  const stageColor = (stage: string) =>
    STAGES.find((s) => s.id === stage)?.color || '#94a3b8';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Deals Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {deals.length} deals · Total: ${totalValue.toLocaleString()} · Won: ${wonValue.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('pipeline')}
              className={`px-4 py-2 text-sm font-medium transition ${
                view === 'pipeline'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 text-sm font-medium transition ${
                view === 'table'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Table
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg hover:opacity-90 shadow-lg shadow-indigo-500/20 text-sm font-medium transition"
          >
            + Add Deal
          </button>
          <button
            onClick={exportCSV}
            className="border border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-sm font-medium transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : view === 'pipeline' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage.id}
                id={stage.id}
                label={stage.label}
                color={stage.color}
                deals={getDealsByStage(stage.id)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeDeal ? <DealCard deal={activeDeal} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <>
          <div className="relative w-full md:w-96 mb-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by company, contact, or deal title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10 w-full border dark:border-gray-600 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900"
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700">
                    {['Company', 'Contact', 'Email', 'Stage', 'Value', 'Owner', 'Close Date', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3.5 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredDealDetails.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-gray-400 dark:text-gray-500">
                        No deals match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredDealDetails.map((deal, idx) => (
                      <tr
                        key={deal.id}
                        className={`transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-500/5 ${
                          idx % 2 === 1 ? 'bg-gray-50/40 dark:bg-gray-900/20' : ''
                        }`}
                      >
                        <td className="px-5 py-4">
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {deal.contact?.company_name || (
                              <span className="font-normal text-gray-300 dark:text-gray-600">—</span>
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                          {deal.contact
                            ? `${deal.contact.first_name} ${deal.contact.last_name}`
                            : <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>

                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                          {deal.contact?.email || <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${stageColor(deal.stage)}1A`,
                              color: stageColor(deal.stage),
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: stageColor(deal.stage) }}
                            />
                            {stageLabel(deal.stage)}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                          {deal.value > 0
                            ? `$${deal.value.toLocaleString()}`
                            : <span className="font-normal text-gray-300 dark:text-gray-600">$0</span>}
                        </td>

                        <td className="px-5 py-4">
                          {deal.owner ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                                {deal.owner.full_name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-gray-600 dark:text-gray-300">{deal.owner.full_name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400 tabular-nums">
                          {deal.expected_close_date
                            ? new Date(deal.expected_close_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => setEditingDeal(deal as unknown as Deal)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-xs px-2 py-1 rounded-md transition font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {(showAddModal || editingDeal) && (
        <AddDealModal
          deal={editingDeal}
          onClose={() => { setShowAddModal(false); setEditingDeal(null); }}
          onSaved={() => { fetchDeals(); fetchDealDetails(); setEditingDeal(null); }}
        />
      )}
    </div>
  );
}