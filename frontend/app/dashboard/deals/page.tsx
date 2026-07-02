'use client';
import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import api from '@/lib/api';
import { Deal, STAGES } from '@/types/deal';
import KanbanColumn from '@/components/KanbanColumn';
import DealCard from '@/components/DealCard';
import AddDealModal from '../../../components/AddDealModal';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [minValFilter, setMinValFilter] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const fetchDeals = async () => {
    try {
      const res = await api.get('/api/deals/');
      setDeals(res.data);
    } catch (err) {
      console.error('Failed to fetch deals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);
    if (!over) return;

    const dealId = active.id as number;
    const newStage = over.id as string;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    const validStages = STAGES.map((s) => s.id);
    if (!validStages.includes(newStage as any)) return;

    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage as Deal['stage'] } : d))
    );

    try {
      await api.patch(`/api/deals/${dealId}/stage`, { stage: newStage });
    } catch (err) {
      console.error('Failed to update stage', err);
      fetchDeals();
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setMinValFilter('');
  };

  // Compute filtered deals in real-time
  const filteredDeals = deals.filter((deal) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || deal.title.toLowerCase().includes(query);

    const minVal = parseFloat(minValFilter);
    const matchesMinVal = isNaN(minVal) || deal.value >= minVal;

    return matchesSearch && matchesMinVal;
  });

  const totalPipelineValue = filteredDeals
    .filter((d) => d.stage !== 'closed_lost')
    .reduce((sum, d) => sum + d.value, 0);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 ">Loading deals...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Deals Pipeline</h1>
          <p className="text-gray-500 ">
            Total pipeline value: ${totalPipelineValue.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          + Add Deal
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:w-80 shrink-0">
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
            className="pl-10 pr-4 h-10 w-full border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100/50 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 justify-start sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Min Value ($):</span>
            <input
              type="number"
              placeholder="Min value..."
              value={minValFilter}
              onChange={e => setMinValFilter(e.target.value)}
              className="h-10 border rounded-lg px-3 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-28"
            />
          </div>

          {(searchQuery || minValFilter) && (
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
          {deals.length === 0 
            ? 'No deals available' 
            : `Showing ${filteredDeals.length} of ${deals.length} deals`}
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              id={stage.id}
              label={stage.label}
              color={stage.color}
              deals={filteredDeals.filter((d) => d.stage === stage.id)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeDeal ? <DealCard deal={activeDeal} /> : null}
        </DragOverlay>
      </DndContext>

      {showModal && (
        <AddDealModal
          onClose={() => setShowModal(false)}
          onCreated={fetchDeals}
        />
      )}
    </div>
  );
}