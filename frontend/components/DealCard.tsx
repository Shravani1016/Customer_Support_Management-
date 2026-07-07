'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '@/types/deal';

interface Props {
  deal: Deal;
  color?: string;
  onEdit?: (deal: Deal) => void;
}

export default function DealCard({ deal, color, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
  });
  const accent = color || '#6366f1';
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md dark:shadow-none p-4 mb-3 cursor-grab active:cursor-grabbing border border-gray-100 dark:border-gray-700/50 hover:-translate-y-0.5 hover:border-gray-200 dark:hover:border-gray-600 transition-all"
    >
      {onEdit && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(deal);
          }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md p-1 transition-all"
          aria-label="Edit deal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}

      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
        <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate pr-5">
          {deal.title}
        </h4>
      </div>

      <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg tabular-nums">
        ${deal.value.toLocaleString()}
      </p>

      {deal.expected_close_date && (
        <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-gray-50 dark:border-gray-700/40">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
            {new Date(deal.expected_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  );
}