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
import { arrayMove } from '@dnd-kit/sortable';
import api from '@/lib/api';
import { Deal, STAGES } from '@/types/deal';
import KanbanColumn from '@/components/KanbanColumn';
import DealCard from '@/components/DealCard';
import AddDealModal from '@/components/AddDealModal';
import toast from 'react-hot-toast';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

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

  useEffect(() => { fetchDeals(); }, []);

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

    // Check if dragging over a column (stage id) or another deal
    const overStage = STAGES.find((s) => s.id === overId);
    if (overStage && activeDealItem.stage !== overStage.id) {
      setDeals((prev) =>
        prev.map((d) =>
          d.id === activeId ? { ...d, stage: overStage.id as Deal['stage'] } : d
        )
      );
    } else {
      // Dragging over a deal card — move to that deal's column
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

    // Persist stage change to backend
    try {
      await api.patch(`/api/deals/${activeId}/stage`, { stage: deal.stage });
    } catch {
      toast.error('Failed to update deal stage');
      fetchDeals(); // revert on error
    }
  };

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const wonDeals = deals.filter((d) => d.stage === 'closed_won');
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Deals Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {deals.length} deals · Total: ${totalValue.toLocaleString()} · Won: ${wonValue.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
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
              />
            ))}
          </div>

          <DragOverlay>
            {activeDeal ? <DealCard deal={activeDeal} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Add Deal Modal */}
      {showAddModal && (
      <AddDealModal
        onClose={() => setShowAddModal(false)}
        onSaved={fetchDeals}
      />
)}
    </div>
  );
}