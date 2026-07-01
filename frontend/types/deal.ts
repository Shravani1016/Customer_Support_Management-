export interface Deal {
  id: number;
  title: string;
  value: number;
  stage: 'prospecting' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  contact_id: number | null;
  owner_id: number | null;
  expected_close_date: string | null;
  created_at: string;
}

export const STAGES = [
  { id: 'prospecting', label: 'Prospecting', color: '#94a3b8' },
  { id: 'proposal', label: 'Proposal', color: '#60a5fa' },
  { id: 'negotiation', label: 'Negotiation', color: '#fbbf24' },
  { id: 'closed_won', label: 'Closed Won', color: '#34d399' },
  { id: 'closed_lost', label: 'Closed Lost', color: '#f87171' },
] as const;