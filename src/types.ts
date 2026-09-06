export type ServiceType = 'website' | 'social_media' | 'both';
export type PaymentStatus = 'paid' | 'partially_paid' | 'due' | 'overdue' | 'upcoming';
export type PipelineStage = 'lead' | 'advance_received' | 'work_in_progress' | 'payment_due' | 'fully_paid';
export type PaymentMethod = 'upi' | 'bank_transfer' | 'cash' | 'other';
export type PaymentType = 'website_onetime' | 'website_maintenance' | 'social_media';

export interface Client {
  id: string;
  name: string;
  business: string;
  phone: string;
  email: string;
  service: ServiceType;
  createdAt: string;

  // Website
  websiteProject?: string;
  websiteTotal?: number;
  websiteAdvance?: number;
  websiteDeliveryDate?: string;
  websiteDueDate?: string;
  websiteStatus?: PaymentStatus;
  websiteStage?: PipelineStage;

  // Maintenance
  maintenanceEnabled?: boolean;
  maintenanceAmount?: number;
  maintenanceStartDate?: string;
  maintenanceNextDue?: string;
  maintenanceStatus?: PaymentStatus;

  // Social media
  socialPackage?: string;
  socialAmount?: number;
  socialStartDate?: string;
  socialNextDue?: string;
  socialAdvance?: number;
  socialOutstanding?: number;
  socialStatus?: PaymentStatus;

  // Totals
  totalContractValue: number;
  totalPaid: number;
  totalDue: number;
  overallStatus: PaymentStatus;
}

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  business: string;
  service: ServiceType;
  paymentType: PaymentType;
  billingMonth?: string;
  totalAmount: number;
  received: number;
  remaining: number;
  date: string;
  dueDate: string;
  method: PaymentMethod;
  transactionId?: string;
  status: PaymentStatus;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  description: string;
  amount?: number;
  status: 'done' | 'warning' | 'upcoming';
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
