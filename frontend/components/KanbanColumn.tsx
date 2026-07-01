'use client';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Deal } from '@/types/deal';
import DealCard from './DealCard';

interface Props {
  id: string;
  label: string;
  color: string;
  deals: Deal[];
}

export default function KanbanColumn({ id, label, color, deals }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex-1 min-w-[280px]">
      <div
        className="rounded-t-lg px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: color }}
      >
        <span className="font-semibold text-white">{label}</span>
        <span className="bg-white/30 text-white text-xs font-bold px-2 py-1 rounded-full">
          {deals.length}
        </span>
      </div>
      <div className="text-xs text-gray-500 px-4 py-2 bg-gray-50">
        ${totalValue.toLocaleString()}
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[400px] p-3 rounded-b-lg transition-colors ${
          isOver ? 'bg-blue-50' : 'bg-gray-100'
        }`}
      >
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}