import type { Client, Payment } from './types';

// Initial clean state with zero data — user will add real clients and payments
export const initialClients: Client[] = [];
export const initialPayments: Payment[] = [];

export const clients: Client[] = initialClients;
export const payments: Payment[] = initialPayments;

export const formatCurrency = (amount: number = 0) =>
  `₹${(amount || 0).toLocaleString('en-IN')}`;

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const daysUntil = (dateStr?: string) => {
  if (!dateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  if (isNaN(due.getTime())) return 0;
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const statusLabel: Record<string, string> = {
  paid: 'PAID',
  partially_paid: 'PARTIAL',
  due: 'DUE',
  overdue: 'OVERDUE',
  upcoming: 'UPCOMING',
};

export const pipelineStageLabel: Record<string, string> = {
  lead: 'Lead',
  advance_received: 'Advance Received',
  work_in_progress: 'Work in Progress',
  payment_due: 'Payment Due',
  fully_paid: 'Fully Paid',
};

export const getClientDisplayName = (name: string = '', business?: string) => {
  if (!name) return 'Walk-in Client';
  if (!business || !business.trim()) return name;
  if (name.toLowerCase().includes(business.toLowerCase())) return name;
  return `${name} (${business.trim()})`;
};

export const isCurrentCalendarMonth = (dateStr?: string) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};



