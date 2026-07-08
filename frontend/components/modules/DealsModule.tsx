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
import { DealDetail, STAGES } from '@/types/deal';
import KanbanColumn from '@/components/KanbanColumn';
import DealCard from '@/components/DealCard';
import AddDealModal from '@/components/AddDealModal';
import toast from 'react-hot-toast';
import { usePagination } from '@/lib/usePagination';
import Pagination from '@/components/Pagination';

export default function DealsModule() {
  const [deals, setDeals] = useState<DealDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DealDetail | null>(null);
  const [activeDeal, setActiveDeal] = useState<DealDetail | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/deals/detail');
      setDeals(res.data);
    } catch {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeals(); }, []);

  const handleToggleActive = async (deal: DealDetail) => {
    try {
      await api.patch(`/api/deals/${deal.id}/active`, { is_active: !deal.is_active });
      toast.success(`Marked ${deal.is_active ? 'inactive' : 'active'}`);
      fetchDeals();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/deals/${id}`);
      toast.success('Deal deleted!');
      fetchDeals();
    } catch {
      toast.error('Failed to delete deal');
    }
  };

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

  const handleClearFilters = () => {
    setSearchQuery('');
    setStageFilter('all');
    setActiveFilter('all');
  };

  const filteredDeals = deals.filter(deal => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || deal.title.toLowerCase().includes(query);

    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;

    const matchesActive =
      activeFilter === 'all' ||
      (activeFilter === 'active' && deal.is_active) ||
      (activeFilter === 'inactive' && !deal.is_active);

    return matchesSearch && matchesStage && matchesActive;
  });

  const {
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  totalItems,
  paginatedItems: paginatedDeals,
  resetPage,
} = usePagination(filteredDeals, 10);

useEffect(() => {
  resetPage();
}, [searchQuery, stageFilter, activeFilter]);

  const getDealsByStage = (stageId: string) =>
    filteredDeals.filter((d) => d.stage === stageId);

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
          d.id === activeId ? { ...d, stage: overStage.id as DealDetail['stage'] } : d
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

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const wonDeals = deals.filter((d) => d.stage === 'closed_won');
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  const stageLabel = (stage: string) => STAGES.find((s) => s.id === stage)?.label || stage;
  const stageColor = (stage: string) => STAGES.find((s) => s.id === stage)?.color || '#94a3b8';

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
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 text-sm font-medium transition ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-medium transition ${
                viewMode === 'table'
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
                placeholder="Search by deal title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 w-full border dark:border-gray-600 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 hover:bg-gray-100/50 dark:hover:bg-gray-900/70 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 justify-start md:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Stage:</span>
                <select
                  value={stageFilter}
                  onChange={e => setStageFilter(e.target.value)}
                  className="h-10 border dark:border-gray-600 rounded-lg px-3 text-sm text-black dark:text-white bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                >
                  <option value="all">All Stages</option>
                  {STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

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

              {(searchQuery || stageFilter !== 'all' || activeFilter !== 'all') && (
                <button
                  onClick={handleClearFilters}
                  className="h-10 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors px-2 hover:underline cursor-pointer flex items-center"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {viewMode === 'table' ? (
            <>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-md shadow-gray-200/50 dark:shadow-none overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-b dark:border-gray-700">
                    <tr>
                      {['Title', 'Value', 'Stage', 'Contact', 'Owner', 'Expected Close', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredDeals.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-gray-400 dark:text-gray-500">No deals match your filters.</td></tr>
                    ) : (
                      paginatedDeals.map(deal => (
                        <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{deal.title}</td>
                          <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                            ${deal.value.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: stageColor(deal.stage) }}
                            >
                              {stageLabel(deal.stage)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                            {deal.contact ? `${deal.contact.first_name} ${deal.contact.last_name}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                            {deal.owner ? deal.owner.full_name : '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                            {deal.expected_close_date
                              ? new Date(deal.expected_close_date).toLocaleDateString()
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingDeal(deal)}
                                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-xs px-2 py-1 rounded-md transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggleActive(deal)}
                                className={`text-xs px-2 py-1 rounded-md transition whitespace-nowrap ${
                                  deal.is_active
                                    ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10'
                                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                {deal.is_active ? '● Active' : '○ Inactive'}
                              </button>
                              <button
                                onClick={() => handleDelete(deal.id)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs px-2 py-1 rounded-md transition"
                              >
                                Delete
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
          ) : (
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
                    onEdit={(deal) => setEditingDeal(deal)}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>

              <DragOverlay>
                {activeDeal ? <DealCard deal={activeDeal} /> : null}
              </DragOverlay>
            </DndContext>
          )}
        </>
      )}

      {(showAddModal || editingDeal) && (
        <AddDealModal
          deal={editingDeal}
          onClose={() => { setShowAddModal(false); setEditingDeal(null); }}
          onSaved={() => { fetchDeals(); setEditingDeal(null); }}
        />
      )}
    </div>
  );
}
