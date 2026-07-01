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

  const totalPipelineValue = deals
    .filter((d) => d.stage !== 'closed_lost')
    .reduce((sum, d) => sum + d.value, 0);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading deals...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Deals Pipeline</h1>
          <p className="text-gray-500">
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
              deals={deals.filter((d) => d.stage === stage.id)}
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