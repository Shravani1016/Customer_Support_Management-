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
  onEdit?: (deal: Deal) => void;
}

export default function KanbanColumn({ id, label, color, deals, onEdit }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{label}</span>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums">
          ${totalValue.toLocaleString()}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[420px] p-2.5 rounded-xl border transition-colors ${
          isOver
            ? 'bg-indigo-50/60 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/30'
            : 'bg-gray-50/60 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800'
        }`}
      >
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-xs text-gray-400 dark:text-gray-600">
              No deals
            </div>
          ) : (
            deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} color={color} onEdit={onEdit} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}