'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '@/types/deal';

export default function DealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow p-4 mb-3 cursor-grab active:cursor-grabbing border border-gray-200 hover:shadow-md transition-shadow"
    >
      <h4 className="font-semibold text-gray-800 mb-1">{deal.title}</h4>
      <p className="text-green-600 font-bold text-lg">
        ${deal.value.toLocaleString()}
      </p>
      {deal.expected_close_date && (
        <p className="text-xs text-gray-500 mt-2">
          Close: {new Date(deal.expected_close_date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}