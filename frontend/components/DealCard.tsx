'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '@/types/deal';

export default function DealCard({ deal, color }: { deal: Deal; color?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderLeftColor: color || '#6366f1',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md dark:shadow-none p-4 mb-3 cursor-grab active:cursor-grabbing border border-gray-100 dark:border-gray-700/50 border-l-4 hover:-translate-y-0.5 transition-all"
    >
      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{deal.title}</h4>
      <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
        ${deal.value.toLocaleString()}
      </p>
      {deal.expected_close_date && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Close: {new Date(deal.expected_close_date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}