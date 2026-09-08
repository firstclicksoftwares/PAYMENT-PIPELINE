import type { Client, Payment } from './types';

export const initialClients: Client[] = [
  {
    id: 'c-nj-beauty',
    name: 'NJ Beauty Studio',
    business: 'NJ Beauty Studio',
    phone: '',
    email: '',
    service: 'social_media',
    createdAt: '2026-09-01',
    socialPackage: 'Monthly Package',
    socialAmount: 7000,
    socialStartDate: '2026-09-01',
    socialNextDue: '2026-10-08',
    socialAdvance: 0,
    socialOutstanding: 7000,
    socialStatus: 'due',
    totalContractValue: 7000,
    totalPaid: 0,
    totalDue: 7000,
    overallStatus: 'due',
  },
  {
    id: 'c-gulzar',
    name: 'Gulzar Restaurant',
    business: 'Gulzar Restaurant',
    phone: '',
    email: '',
    service: 'social_media',
    createdAt: '2026-09-01',
    socialPackage: 'Monthly Package',
    socialAmount: 6000,
    socialStartDate: '2026-09-01',
    socialNextDue: '2026-10-13',
    socialAdvance: 2000,
    socialOutstanding: 4000,
    socialStatus: 'partially_paid',
    totalContractValue: 6000,
    totalPaid: 2000,
    totalDue: 4000,
    overallStatus: 'partially_paid',
  },
  {
    id: 'c-fitness-rhythm',
    name: 'Fitness & Rhythm',
    business: 'Fitness & Rhythm Yoga',
    phone: '',
    email: '',
    service: 'social_media',
    createdAt: '2026-09-01',
    socialPackage: 'Monthly Package',
    socialAmount: 8000,
    socialStartDate: '2026-09-01',
    socialNextDue: '2026-10-08',
    socialAdvance: 4000,
    socialOutstanding: 4000,
    socialStatus: 'partially_paid',
    totalContractValue: 8000,
    totalPaid: 4000,
    totalDue: 4000,
    overallStatus: 'partially_paid',
  },
  {
    id: 'c-mh-elite',
    name: 'MH Elite',
    business: 'MH Elite Fitness',
    phone: '',
    email: '',
    service: 'social_media',
    createdAt: '2026-09-01',
    socialPackage: 'Monthly Package',
    socialAmount: 5000,
    socialStartDate: '2026-09-01',
    socialNextDue: '2026-10-12',
    socialAdvance: 0,
    socialOutstanding: 5000,
    socialStatus: 'due',
    totalContractValue: 5000,
    totalPaid: 0,
    totalDue: 5000,
    overallStatus: 'due',
  },
  {
    id: 'c-blossom',
    name: 'Blossom Studio',
    business: 'Blossom Studio',
    phone: '',
    email: '',
    service: 'social_media',
    createdAt: '2026-09-01',
    socialPackage: 'Monthly Package',
    socialAmount: 11000,
    socialStartDate: '2026-09-01',
    socialNextDue: '2026-10-06',
    socialAdvance: 0,
    socialOutstanding: 11000,
    socialStatus: 'due',
    totalContractValue: 11000,
    totalPaid: 0,
    totalDue: 11000,
    overallStatus: 'due',
  },
  {
    id: 'c-web-advance',
    name: 'Navya Bridals',
    business: 'Navya Bridals',
    phone: '',
    email: '',
    service: 'website',
    createdAt: '2026-09-01',
    websiteProject: 'E-Commerce Site',
    websiteTotal: 8000,
    websiteAdvance: 4000,
    websiteDueDate: '2026-10-15',
    websiteStatus: 'partially_paid',
    websiteStage: 'advance_received',
    totalContractValue: 8000,
    totalPaid: 4000,
    totalDue: 4000,
    overallStatus: 'partially_paid',
  },
  {
    id: 'c-web-paid',
    name: 'Website Client',
    business: 'Normal Website',
    phone: '',
    email: '',
    service: 'website',
    createdAt: '2026-09-01',
    websiteProject: 'Business Website',
    websiteTotal: 2000,
    websiteAdvance: 2000,
    websiteDueDate: '2026-09-01',
    websiteStatus: 'paid',
    websiteStage: 'fully_paid',
    totalContractValue: 2000,
    totalPaid: 2000,
    totalDue: 0,
    overallStatus: 'paid',
  },
];

export const initialPayments: Payment[] = [
  {
    id: 'p-gulzar-1',
    clientId: 'c-gulzar',
    clientName: 'Gulzar Restaurant',
    business: 'Gulzar Restaurant',
    service: 'social_media',
    paymentType: 'social_media',
    totalAmount: 6000,
    received: 2000,
    remaining: 4000,
    date: '2026-09-01',
    dueDate: '2026-10-13',
    method: 'upi',
    status: 'partially_paid',
  },
  {
    id: 'p-fitness-1',
    clientId: 'c-fitness-rhythm',
    clientName: 'Fitness & Rhythm',
    business: 'Fitness & Rhythm Yoga',
    service: 'social_media',
    paymentType: 'social_media',
    totalAmount: 8000,
    received: 4000,
    remaining: 4000,
    date: '2026-09-01',
    dueDate: '2026-10-08',
    method: 'upi',
    status: 'partially_paid',
  },
  {
    id: 'p-nj-1',
    clientId: 'c-nj-beauty',
    clientName: 'NJ Beauty Studio',
    business: 'NJ Beauty Studio',
    service: 'social_media',
    paymentType: 'social_media',
    totalAmount: 7000,
    received: 0,
    remaining: 7000,
    date: '2026-09-01',
    dueDate: '2026-10-08',
    method: 'upi',
    status: 'due',
  },
  {
    id: 'p-mh-1',
    clientId: 'c-mh-elite',
    clientName: 'MH Elite',
    business: 'MH Elite Fitness',
    service: 'social_media',
    paymentType: 'social_media',
    totalAmount: 5000,
    received: 0,
    remaining: 5000,
    date: '2026-09-01',
    dueDate: '2026-10-12',
    method: 'upi',
    status: 'due',
  },
  {
    id: 'p-blossom-1',
    clientId: 'c-blossom',
    clientName: 'Blossom Studio',
    business: 'Blossom Studio',
    service: 'social_media',
    paymentType: 'social_media',
    totalAmount: 11000,
    received: 0,
    remaining: 11000,
    date: '2026-09-01',
    dueDate: '2026-10-06',
    method: 'upi',
    status: 'due',
  },
  {
    id: 'p-web-advance-1',
    clientId: 'c-web-advance',
    clientName: 'Navya Bridals',
    business: 'Navya Bridals',
    service: 'website',
    paymentType: 'website_onetime',
    totalAmount: 8000,
    received: 4000,
    remaining: 4000,
    date: '2026-09-01',
    dueDate: '2026-10-15',
    method: 'upi',
    status: 'partially_paid',
  },
  {
    id: 'p-web-paid-1',
    clientId: 'c-web-paid',
    clientName: 'Website Client',
    business: 'Normal Website',
    service: 'website',
    paymentType: 'website_onetime',
    totalAmount: 2000,
    received: 2000,
    remaining: 0,
    date: '2026-09-01',
    dueDate: '2026-09-01',
    method: 'upi',
    status: 'paid',
  },
];

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



