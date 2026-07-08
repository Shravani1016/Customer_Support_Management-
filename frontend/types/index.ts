export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'sales_rep';
  is_active: boolean;
}

export interface Lead {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';
  source?: string;
  owner_id?: number;
  company_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company_id?: number;
  is_active: boolean;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Deal {
  id: number;
  title: string;
  value: number;
  stage: 'prospecting' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  contact_id?: number;
  owner_id?: number;
  is_active: boolean;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
  assigned_to_id?: number;
  lead_id?: number;
  contact_id?: number;
  deal_id?: number;
  created_at: string;
}