export interface Activity {
  id: number;
  type: 'call' | 'email' | 'note' | 'meeting';
  note: string | null;
  created_by_id: number | null;
  lead_id: number | null;
  contact_id: number | null;
  deal_id: number | null;
  created_at: string;
}

export const ACTIVITY_ICONS: Record<string, string> = {
  call: '📞',
  email: '✉️',
  note: '📝',
  meeting: '🤝',
};

export const ACTIVITY_COLORS: Record<string, string> = {
  call: 'bg-blue-100 text-blue-700',
  email: 'bg-purple-100 text-purple-700',
  note: 'bg-gray-100 text-gray-700',
  meeting: 'bg-green-100 text-green-700',
};