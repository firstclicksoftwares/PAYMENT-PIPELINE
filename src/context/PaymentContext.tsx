import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { initialClients, initialPayments, getClientDisplayName } from '../data';
import type { Client, Payment, PaymentStatus, PipelineStage } from '../types';

interface PaymentContextType {
  clients: Client[];
  payments: Payment[];
  loading: boolean;
  isConnected: boolean;
  isLocalStorage: boolean;
  dbError: string | null;
  addClient: (clientData: Omit<Client, 'id' | 'createdAt'>) => Promise<Client | null>;
  recordPayment: (paymentData: Omit<Payment, 'id'>) => Promise<Payment | null>;
  deletePayment: (id: string) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
  updateWebsiteStage: (clientId: string, stage: PipelineStage) => Promise<boolean>;
  updatePayment: (id: string, updatedFields: Partial<Payment>) => Promise<boolean>;
  updateClient: (id: string, updatedFields: Partial<Client>) => Promise<boolean>;
  refreshData: () => Promise<void>;
  resetToDemoData: () => void;
  resetPaymentsKeepClients: () => void;
  resetAllData: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

const LOCAL_CLIENTS_KEY = 'fc_payment_hub_clients_v3';
const LOCAL_PAYMENTS_KEY = 'fc_payment_hub_payments_v3';

function loadLocalClients(): Client[] {
  try {
    const raw = localStorage.getItem(LOCAL_CLIENTS_KEY);
    if (raw) {
      const parsed: Client[] = JSON.parse(raw);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading local clients:', e);
  }

  // Auto-recovery: If clients array is empty but payments exist in localStorage, reconstruct client objects!
  try {
    const rawPayments = localStorage.getItem(LOCAL_PAYMENTS_KEY);
    if (rawPayments) {
      const payments: Payment[] = JSON.parse(rawPayments);
      if (payments.length > 0) {
        const clientMap = new Map<string, Client>();
        payments.forEach(p => {
          const cid = p.clientId || ('client-' + p.clientName);
          if (!clientMap.has(cid)) {
            const rawName = p.clientName.replace(/\s*\([^)]*\)/g, '').trim() || p.clientName;
            clientMap.set(cid, {
              id: cid,
              name: rawName,
              business: p.business || '',
              phone: '',
              email: '',
              service: p.service === 'social_media' ? 'social_media' : 'website',
              createdAt: p.date || new Date().toISOString().split('T')[0],
              websiteProject: p.service === 'website' ? 'Website Project' : undefined,
              websiteTotal: p.service === 'website' ? p.totalAmount : 0,
              websiteAdvance: p.service === 'website' ? p.received : 0,
              websiteDueDate: p.service === 'website' ? p.dueDate : undefined,
              websiteStatus: p.service === 'website' ? p.status : undefined,
              socialPackage: p.service === 'social_media' ? 'Monthly Package' : undefined,
              socialAmount: p.service === 'social_media' ? p.totalAmount : 0,
              socialAdvance: p.service === 'social_media' ? p.received : 0,
              socialNextDue: p.service === 'social_media' ? p.dueDate : undefined,
              socialStatus: p.service === 'social_media' ? p.status : undefined,
              totalContractValue: p.totalAmount,
              totalPaid: p.received,
              totalDue: p.remaining,
              overallStatus: p.status,
            });
          } else {
            const existing = clientMap.get(cid)!;
            existing.totalContractValue += p.totalAmount;
            existing.totalPaid += p.received;
            existing.totalDue = Math.max(0, existing.totalContractValue - existing.totalPaid);
            existing.overallStatus = existing.totalDue === 0 ? 'paid' : existing.totalPaid > 0 ? 'partially_paid' : 'due';
            if (p.service === 'social_media') {
              existing.service = 'both';
              existing.socialAmount = p.totalAmount;
              existing.socialAdvance = p.received;
              existing.socialNextDue = p.dueDate;
              existing.socialStatus = p.status;
            }
          }
        });
        const recovered = Array.from(clientMap.values());
        if (recovered.length > 0) {
          saveLocalClients(recovered);
          return recovered;
        }
      }
    }
  } catch (e) {
    console.error('Error in auto-reconstructing clients:', e);
  }

  saveLocalClients(initialClients);
  return initialClients;
}

function saveLocalClients(clients: Client[]) {
  try {
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Error saving local clients:', e);
  }
}

function loadLocalPayments(): Payment[] {
  try {
    const raw = localStorage.getItem(LOCAL_PAYMENTS_KEY);
    if (raw) {
      const parsed: Payment[] = JSON.parse(raw);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading local payments:', e);
  }
  saveLocalPayments(initialPayments);
  return initialPayments;
}

function saveLocalPayments(payments: Payment[]) {
  try {
    localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(payments));
  } catch (e) {
    console.error('Error saving local payments:', e);
  }
}

// Helper to convert DB row to Client interface
function mapClientFromDb(row: any): Client {
  return {
    id: row.id,
    name: row.name || '',
    business: row.business || '',
    phone: row.phone || '',
    email: row.email || '',
    service: row.service || 'website',
    createdAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],

    websiteProject: row.website_project || '',
    websiteTotal: Number(row.website_total) || 0,
    websiteAdvance: Number(row.website_advance) || 0,
    websiteDeliveryDate: row.website_delivery_date || '',
    websiteDueDate: row.website_due_date || '',
    websiteStatus: (row.website_status as PaymentStatus) || 'upcoming',
    websiteStage: row.website_stage || 'lead',

    maintenanceEnabled: !!row.maintenance_enabled,
    maintenanceAmount: Number(row.maintenance_amount) || 0,
    maintenanceStartDate: row.maintenance_start_date || '',
    maintenanceNextDue: row.maintenance_next_due || '',
    maintenanceStatus: (row.maintenance_status as PaymentStatus) || 'upcoming',

    socialPackage: row.social_package || '',
    socialAmount: Number(row.social_amount) || 0,
    socialStartDate: row.social_start_date || '',
    socialNextDue: row.social_next_due || '',
    socialAdvance: Number(row.social_advance) || 0,
    socialOutstanding: Number(row.social_outstanding) || 0,
    socialStatus: (row.social_status as PaymentStatus) || 'upcoming',

    totalContractValue: Number(row.total_contract_value) || 0,
    totalPaid: Number(row.total_paid) || 0,
    totalDue: Number(row.total_due) || 0,
    overallStatus: (row.overall_status as PaymentStatus) || 'due',
  };
}

// Helper to convert Client interface to DB row
function mapClientToDb(c: Partial<Client>) {
  return {
    ...(c.id ? { id: c.id } : {}),
    name: c.name,
    business: c.business,
    phone: c.phone,
    email: c.email,
    service: c.service,
    website_project: c.websiteProject,
    website_total: c.websiteTotal,
    website_advance: c.websiteAdvance,
    website_delivery_date: c.websiteDeliveryDate || null,
    website_due_date: c.websiteDueDate || null,
    website_status: c.websiteStatus,
    website_stage: c.websiteStage,
    maintenance_enabled: c.maintenanceEnabled,
    maintenance_amount: c.maintenanceAmount,
    maintenance_start_date: c.maintenanceStartDate || null,
    maintenance_next_due: c.maintenanceNextDue || null,
    maintenance_status: c.maintenanceStatus,
    social_package: c.socialPackage,
    social_amount: c.socialAmount,
    social_start_date: c.socialStartDate || null,
    social_next_due: c.socialNextDue || null,
    social_advance: c.socialAdvance,
    social_outstanding: c.socialOutstanding,
    social_status: c.socialStatus,
    total_contract_value: c.totalContractValue,
    total_paid: c.totalPaid,
    total_due: c.totalDue,
    overall_status: c.overallStatus,
  };
}

// Helper to convert DB row to Payment interface
function mapPaymentFromDb(row: any): Payment {
  return {
    id: row.id,
    clientId: row.client_id || '',
    clientName: row.client_name || '',
    business: row.business || '',
    service: row.service || 'website',
    paymentType: row.payment_type || 'website_onetime',
    totalAmount: Number(row.total_amount) || 0,
    received: Number(row.received) || 0,
    remaining: Number(row.remaining) || 0,
    date: row.date || new Date().toISOString().split('T')[0],
    dueDate: row.due_date || '',
    method: row.method || 'upi',
    transactionId: row.transaction_id || '',
    status: (row.status as PaymentStatus) || 'due',
    notes: row.notes || '',
  };
}

// Helper to convert Payment interface to DB row
function mapPaymentToDb(p: Partial<Payment>) {
  return {
    ...(p.id ? { id: p.id } : {}),
    client_id: p.clientId || null,
    client_name: p.clientName,
    business: p.business,
    service: p.service,
    payment_type: p.paymentType,
    total_amount: p.totalAmount,
    received: p.received,
    remaining: p.remaining,
    date: p.date,
    due_date: p.dueDate || null,
    method: p.method,
    transaction_id: p.transactionId,
    status: p.status,
    notes: p.notes,
  };
}

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [isLocalStorage, setIsLocalStorage] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setDbError(null);
      const [clientsRes, paymentsRes] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
      ]);

      if (clientsRes.error) {
        // Table does not exist in Supabase -> fallback to LocalStorage mode
        setIsLocalStorage(true);
        setClients(prev => (prev.length > 0 ? prev : loadLocalClients()));
        setPayments(prev => (prev.length > 0 ? prev : loadLocalPayments()));
        setDbError("Operating in Local persistent mode.");
      } else {
        setIsLocalStorage(false);
        if (clientsRes.data) {
          setClients(clientsRes.data.map(mapClientFromDb));
        }
        if (paymentsRes.data) {
          setPayments(paymentsRes.data.map(mapPaymentFromDb));
        }
      }
      setIsConnected(true);
    } catch (err: any) {
      console.error('Supabase fetch error, switching to LocalStorage mode:', err);
      setIsLocalStorage(true);
      setClients(prev => (prev.length > 0 ? prev : loadLocalClients()));
      setPayments(prev => (prev.length > 0 ? prev : loadLocalPayments()));
      setIsConnected(false);
      setDbError('Operating in Local persistent mode.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup Realtime listeners
  useEffect(() => {
    fetchAllData();

    const channel = supabase
      .channel('payment_hub_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        () => {
          fetchAllData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          fetchAllData();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllData]);

  const resetToDemoData = () => {
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(initialClients));
    localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(initialPayments));
    setClients(initialClients);
    setPayments(initialPayments);
  };

  const resetAllData = () => {
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify([]));
    localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify([]));
    setClients([]);
    setPayments([]);
    try {
      supabase.from('payments').delete().neq('id', '0').then();
      supabase.from('clients').delete().neq('id', '0').then();
    } catch (e) {
      console.warn('Supabase reset all error:', e);
    }
  };

  const resetPaymentsKeepClients = () => {
    setClients(prev => {
      const updatedClients = prev.map(c => {
        const isWebsite = c.service === 'website' || c.service === 'both';
        const isSocial = c.service === 'social_media' || c.service === 'both';
        const websiteTotal = isWebsite ? (c.websiteTotal || 0) : 0;
        const socialAmount = isSocial ? (c.socialAmount || 0) : 0;
        const maintenanceAmount = (isWebsite && c.maintenanceEnabled) ? (c.maintenanceAmount || 0) : 0;
        const totalContractValue = websiteTotal + socialAmount + maintenanceAmount;

        return {
          ...c,
          websiteAdvance: 0,
          websiteStatus: websiteTotal > 0 ? ('due' as PaymentStatus) : ('upcoming' as PaymentStatus),
          websiteStage: 'lead' as PipelineStage,
          socialAdvance: 0,
          socialOutstanding: socialAmount,
          socialStatus: socialAmount > 0 ? ('due' as PaymentStatus) : ('upcoming' as PaymentStatus),
          maintenanceStatus: maintenanceAmount > 0 ? ('due' as PaymentStatus) : ('upcoming' as PaymentStatus),
          totalPaid: 0,
          totalDue: totalContractValue,
          overallStatus: totalContractValue > 0 ? ('due' as PaymentStatus) : ('upcoming' as PaymentStatus),
        };
      });
      saveLocalClients(updatedClients);

      // Re-generate fresh initial pending payments for existing clients
      const freshPayments: Payment[] = [];
      updatedClients.forEach(client => {
        const isWebsite = client.service === 'website' || client.service === 'both';
        const isSocial = client.service === 'social_media' || client.service === 'both';
        const displayName = getClientDisplayName(client.name, client.business);

        if (isWebsite && (client.websiteTotal || 0) > 0) {
          freshPayments.push({
            id: 'pay-' + Date.now() + '-' + client.id.slice(-4) + '-web',
            clientId: client.id,
            clientName: displayName,
            business: client.business,
            service: 'website',
            paymentType: 'website_onetime',
            totalAmount: client.websiteTotal || 0,
            received: 0,
            remaining: client.websiteTotal || 0,
            date: client.createdAt,
            dueDate: client.websiteDueDate || client.createdAt,
            method: 'upi',
            status: 'due',
            notes: 'Website Payment Due',
          });
        }

        if (isSocial && (client.socialAmount || 0) > 0) {
          freshPayments.push({
            id: 'pay-' + Date.now() + '-' + client.id.slice(-4) + '-soc',
            clientId: client.id,
            clientName: displayName,
            business: client.business,
            service: 'social_media',
            paymentType: 'social_media',
            totalAmount: client.socialAmount || 0,
            received: 0,
            remaining: client.socialAmount || 0,
            date: client.createdAt,
            dueDate: client.socialNextDue || client.createdAt,
            method: 'upi',
            status: 'due',
            notes: 'Social Media Billing Due',
          });
        }

        if (isWebsite && client.maintenanceEnabled && (client.maintenanceAmount || 0) > 0) {
          freshPayments.push({
            id: 'pay-' + Date.now() + '-' + client.id.slice(-4) + '-maint',
            clientId: client.id,
            clientName: displayName,
            business: client.business,
            service: 'website',
            paymentType: 'website_maintenance',
            totalAmount: client.maintenanceAmount || 0,
            received: 0,
            remaining: client.maintenanceAmount || 0,
            date: client.createdAt,
            dueDate: client.maintenanceNextDue || client.createdAt,
            method: 'upi',
            status: 'due',
            notes: 'Website Monthly Maintenance',
          });
        }
      });

      setPayments(freshPayments);
      saveLocalPayments(freshPayments);

      try {
        supabase.from('payments').delete().neq('id', '0').then();
      } catch (e) {
        console.warn('Supabase reset payments error:', e);
      }

      return updatedClients;
    });
  };

  const recordPayment = async (paymentData: Omit<Payment, 'id'>): Promise<Payment | null> => {
    const newId = 'pay-' + Date.now();
    const newPayment: Payment = {
      ...paymentData,
      id: newId,
    };

    // Update payments state and storage via functional setter
    setPayments(prev => {
      const updated = [newPayment, ...prev];
      saveLocalPayments(updated);
      return updated;
    });

    if (newPayment.clientId) {
      setClients(prev => {
        const updated = prev.map(c => {
          if (c.id === newPayment.clientId) {
            const updatedPaid = (c.totalPaid || 0) + newPayment.received;
            const updatedDue = Math.max(0, (c.totalContractValue || 0) - updatedPaid);
            const overallStatus: PaymentStatus = updatedDue === 0 ? 'paid' : updatedPaid > 0 ? 'partially_paid' : 'due';

            const isSocialPaid = newPayment.paymentType === 'social_media' && newPayment.remaining === 0;
            const isWebsitePaid = newPayment.paymentType === 'website_onetime' && newPayment.remaining === 0;
            const isMaintPaid = newPayment.paymentType === 'website_maintenance' && newPayment.remaining === 0;

            return {
              ...c,
              totalPaid: updatedPaid,
              totalDue: updatedDue,
              overallStatus,
              ...(isSocialPaid ? { socialStatus: 'paid' as PaymentStatus, socialOutstanding: 0 } : {}),
              ...(isWebsitePaid ? { websiteStatus: 'paid' as PaymentStatus, websiteStage: 'fully_paid' as PipelineStage } : {}),
              ...(isMaintPaid ? { maintenanceStatus: 'paid' as PaymentStatus } : {}),
            };
          }
          return c;
        });
        saveLocalClients(updated);
        return updated;
      });
    }

    try {
      const payload = mapPaymentToDb(paymentData);
      await supabase.from('payments').insert([payload]);
    } catch (e) {
      console.warn('Supabase payment insert skipped');
    }

    return newPayment;
  };

  const updateWebsiteStage = async (clientId: string, stage: PipelineStage): Promise<boolean> => {
    let newStatus: PaymentStatus | undefined = undefined;
    if (stage === 'fully_paid') newStatus = 'paid';
    else if (stage === 'advance_received') newStatus = 'partially_paid';
    else if (stage === 'payment_due') newStatus = 'due';

    setClients(prev => {
      const updated = prev.map(c => {
        if (c.id === clientId) {
          return {
            ...c,
            websiteStage: stage,
            ...(newStatus ? { websiteStatus: newStatus } : {}),
          };
        }
        return c;
      });
      saveLocalClients(updated);
      return updated;
    });

    try {
      const updateData: any = { website_stage: stage };
      if (newStatus) updateData.website_status = newStatus;
      await supabase.from('clients').update(updateData).eq('id', clientId);
    } catch (e) {
      console.warn('Supabase website_stage update skipped:', e);
    }

    return true;
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>): Promise<Client | null> => {
    const newId = 'client-' + Date.now();
    const createdAt = new Date().toISOString().split('T')[0];

    const isWebsite = clientData.service === 'website' || clientData.service === 'both';
    const isSocial = clientData.service === 'social_media' || clientData.service === 'both';

    const websiteTotal = isWebsite ? (clientData.websiteTotal || 0) : 0;
    const websiteAdvance = isWebsite ? (clientData.websiteAdvance || 0) : 0;
    const websiteRemaining = Math.max(0, websiteTotal - websiteAdvance);

    const socialAmount = isSocial ? (clientData.socialAmount || 0) : 0;
    const socialAdvance = isSocial ? (clientData.socialAdvance || 0) : 0;
    const socialOutstanding = Math.max(0, socialAmount - socialAdvance);

    const maintenanceAmount = (isWebsite && clientData.maintenanceEnabled) ? (clientData.maintenanceAmount || 0) : 0;

    const totalContractValue = websiteTotal + socialAmount + maintenanceAmount;
    const totalPaid = websiteAdvance + socialAdvance;
    const totalDue = Math.max(0, totalContractValue - totalPaid);
    const overallStatus: PaymentStatus = totalDue === 0 && totalContractValue > 0 ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'due';

    const displayName = getClientDisplayName(clientData.name, clientData.business);

    const newClient: Client = {
      ...clientData,
      id: newId,
      createdAt,
      totalContractValue,
      totalPaid,
      totalDue,
      overallStatus,
    };

    const newPayments: Payment[] = [];

    // 1. Website payment
    if (isWebsite && (websiteTotal > 0 || websiteAdvance > 0 || clientData.websiteDueDate)) {
      newPayments.push({
        id: 'pay-' + Date.now() + '-web',
        clientId: newClient.id,
        clientName: displayName,
        business: newClient.business,
        service: 'website',
        paymentType: 'website_onetime',
        totalAmount: websiteTotal,
        received: websiteAdvance,
        remaining: websiteRemaining,
        date: createdAt,
        dueDate: clientData.websiteDueDate || createdAt,
        method: 'upi',
        status: websiteRemaining === 0 && websiteTotal > 0 ? 'paid' : websiteAdvance > 0 ? 'partially_paid' : 'due',
        notes: websiteAdvance > 0 ? 'Initial Website Advance' : 'Website Payment Due',
      });
    }

    // 2. Social Media payment
    if (isSocial && (socialAmount > 0 || socialAdvance > 0 || clientData.socialNextDue)) {
      newPayments.push({
        id: 'pay-' + Date.now() + '-soc',
        clientId: newClient.id,
        clientName: displayName,
        business: newClient.business,
        service: 'social_media',
        paymentType: 'social_media',
        totalAmount: socialAmount,
        received: socialAdvance,
        remaining: socialOutstanding,
        date: createdAt,
        dueDate: clientData.socialNextDue || createdAt,
        method: 'upi',
        status: socialOutstanding === 0 && socialAmount > 0 ? 'paid' : socialAdvance > 0 ? 'partially_paid' : 'due',
        notes: socialAdvance > 0 ? 'Initial Social Media Advance' : 'Social Media Billing Due',
      });
    }

    // 3. Maintenance payment
    if (isWebsite && clientData.maintenanceEnabled && maintenanceAmount > 0) {
      newPayments.push({
        id: 'pay-' + Date.now() + '-maint',
        clientId: newClient.id,
        clientName: displayName,
        business: newClient.business,
        service: 'website',
        paymentType: 'website_maintenance',
        totalAmount: maintenanceAmount,
        received: 0,
        remaining: maintenanceAmount,
        date: createdAt,
        dueDate: clientData.maintenanceNextDue || createdAt,
        method: 'upi',
        status: 'due',
        notes: 'Website Monthly Maintenance',
      });
    }

    // Atomic state + localStorage update for clients and payments
    setClients(prev => {
      const updated = [newClient, ...prev.filter(c => c.id !== newClient.id)];
      saveLocalClients(updated);
      return updated;
    });

    if (newPayments.length > 0) {
      setPayments(prev => {
        const updated = [...newPayments, ...prev];
        saveLocalPayments(updated);
        return updated;
      });
    }

    try {
      await supabase.from('clients').insert([mapClientToDb(newClient)]);
      for (const p of newPayments) {
        await supabase.from('payments').insert([mapPaymentToDb(p)]);
      }
    } catch (err: any) {
      console.warn('addClient Supabase sync skipped:', err);
    }

    return newClient;
  };

  const deletePayment = async (id: string): Promise<boolean> => {
    let targetPayment: Payment | undefined = payments.find(p => p.id === id);

    setPayments(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveLocalPayments(updated);
      return updated;
    });

    const cid = targetPayment?.clientId;
    if (cid) {
      const remainingPayments = payments.filter(p => p.id !== id && p.clientId === cid);
      const totalPaid = remainingPayments.reduce((sum, p) => sum + (p.received || 0), 0);

      const webPayments = remainingPayments.filter(p => p.service === 'website' || p.paymentType === 'website_onetime');
      const websiteAdvance = webPayments.reduce((sum, p) => sum + (p.received || 0), 0);

      const socialPayments = remainingPayments.filter(p => p.service === 'social_media' || p.paymentType === 'social_media');
      const socialAdvance = socialPayments.reduce((sum, p) => sum + (p.received || 0), 0);

      setClients(prevClients => {
        const updatedClients = prevClients.map(c => {
          if (c.id === cid) {
            const totalDue = Math.max(0, (c.totalContractValue || 0) - totalPaid);
            const overallStatus: PaymentStatus = totalDue === 0 && (c.totalContractValue || 0) > 0 ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'due';

            const websiteRemaining = Math.max(0, (c.websiteTotal || 0) - websiteAdvance);
            const websiteStatus: PaymentStatus = websiteRemaining === 0 && (c.websiteTotal || 0) > 0 ? 'paid' : websiteAdvance > 0 ? 'partially_paid' : 'due';

            let websiteStage: PipelineStage = c.websiteStage || 'lead';
            if (websiteAdvance === 0 && websiteStage === 'advance_received') {
              websiteStage = (c.websiteTotal || 0) > 0 ? 'payment_due' : 'lead';
            } else if (websiteRemaining === 0 && (c.websiteTotal || 0) > 0) {
              websiteStage = 'fully_paid';
            }

            const socialOutstanding = Math.max(0, (c.socialAmount || 0) - socialAdvance);
            const socialStatus: PaymentStatus = socialOutstanding === 0 && (c.socialAmount || 0) > 0 ? 'paid' : socialAdvance > 0 ? 'partially_paid' : 'due';

            const updatedClient: Client = {
              ...c,
              totalPaid,
              totalDue,
              overallStatus,
              websiteAdvance,
              websiteStatus,
              websiteStage,
              socialAdvance,
              socialOutstanding,
              socialStatus,
            };

            try {
              supabase.from('clients').update(mapClientToDb(updatedClient)).eq('id', cid).then();
            } catch (e) {
              console.warn('Supabase client sync after delete error:', e);
            }

            return updatedClient;
          }
          return c;
        });

        saveLocalClients(updatedClients);
        return updatedClients;
      });
    }

    try {
      await supabase.from('payments').delete().eq('id', id);
    } catch (err) {
      console.error('deletePayment error:', err);
    }
    return true;
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    setClients(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveLocalClients(updated);
      return updated;
    });
    setPayments(prev => {
      const updated = prev.filter(p => p.clientId !== id);
      saveLocalPayments(updated);
      return updated;
    });
    try {
      await supabase.from('clients').delete().eq('id', id);
      await supabase.from('payments').delete().eq('client_id', id);
    } catch (err) {
      console.error('deleteClient error:', err);
    }
    return true;
  };

  const updatePayment = async (id: string, updatedFields: Partial<Payment>): Promise<boolean> => {
    let targetClientId: string | undefined = undefined;

    setPayments(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          targetClientId = p.clientId;
          return { ...p, ...updatedFields };
        }
        return p;
      });
      saveLocalPayments(updated);
      return updated;
    });

    if (targetClientId) {
      setClients(prevClients => {
        const freshPayments = payments.map(p => p.id === id ? { ...p, ...updatedFields } : p);
        const clientPayments = freshPayments.filter(p => p.clientId === targetClientId);
        const totalPaid = clientPayments.reduce((sum, p) => sum + (p.received || 0), 0);

        const webPayments = clientPayments.filter(p => p.service === 'website' || p.paymentType === 'website_onetime');
        const websiteAdvance = webPayments.reduce((sum, p) => sum + (p.received || 0), 0);

        const socialPayments = clientPayments.filter(p => p.service === 'social_media' || p.paymentType === 'social_media');
        const socialAdvance = socialPayments.reduce((sum, p) => sum + (p.received || 0), 0);

        const updatedClients = prevClients.map(c => {
          if (c.id === targetClientId) {
            const totalDue = Math.max(0, (c.totalContractValue || 0) - totalPaid);
            const overallStatus: PaymentStatus =
              totalDue === 0 && (c.totalContractValue || 0) > 0 ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'due';

            const websiteRemaining = Math.max(0, (c.websiteTotal || 0) - websiteAdvance);
            const websiteStatus: PaymentStatus =
              websiteRemaining === 0 && (c.websiteTotal || 0) > 0 ? 'paid' : websiteAdvance > 0 ? 'partially_paid' : 'due';

            const socialOutstanding = Math.max(0, (c.socialAmount || 0) - socialAdvance);
            const socialStatus: PaymentStatus =
              socialOutstanding === 0 && (c.socialAmount || 0) > 0 ? 'paid' : socialAdvance > 0 ? 'partially_paid' : 'due';

            const updatedClient: Client = {
              ...c,
              totalPaid,
              totalDue,
              overallStatus,
              websiteAdvance,
              websiteStatus,
              socialAdvance,
              socialOutstanding,
              socialStatus,
            };

            try {
              supabase.from('clients').update(mapClientToDb(updatedClient)).eq('id', targetClientId).then();
            } catch (e) {
              console.warn('Supabase client sync after payment update error:', e);
            }

            return updatedClient;
          }
          return c;
        });

        saveLocalClients(updatedClients);
        return updatedClients;
      });
    }

    try {
      await supabase.from('payments').update(mapPaymentToDb(updatedFields)).eq('id', id);
    } catch (err) {
      console.error('updatePayment error:', err);
    }
    return true;
  };

  const updateClient = async (id: string, updatedFields: Partial<Client>): Promise<boolean> => {
    let updatedClientObj: Client | undefined = undefined;

    setClients(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          const isWebsite = (updatedFields.service || c.service) === 'website' || (updatedFields.service || c.service) === 'both';
          const isSocial = (updatedFields.service || c.service) === 'social_media' || (updatedFields.service || c.service) === 'both';

          const websiteTotal = isWebsite ? (updatedFields.websiteTotal ?? c.websiteTotal ?? 0) : 0;
          const websiteAdvance = isWebsite ? (updatedFields.websiteAdvance ?? c.websiteAdvance ?? 0) : 0;
          const socialAmount = isSocial ? (updatedFields.socialAmount ?? c.socialAmount ?? 0) : 0;
          const socialAdvance = isSocial ? (updatedFields.socialAdvance ?? c.socialAdvance ?? 0) : 0;
          const maintenanceAmount = (isWebsite && (updatedFields.maintenanceEnabled ?? c.maintenanceEnabled)) ? (updatedFields.maintenanceAmount ?? c.maintenanceAmount ?? 0) : 0;

          const totalContractValue = websiteTotal + socialAmount + maintenanceAmount;
          const totalPaid = websiteAdvance + socialAdvance;
          const totalDue = Math.max(0, totalContractValue - totalPaid);
          const overallStatus: PaymentStatus = totalDue === 0 && totalContractValue > 0 ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'due';

          updatedClientObj = {
            ...c,
            ...updatedFields,
            totalContractValue,
            totalPaid,
            totalDue,
            overallStatus,
          };
          return updatedClientObj;
        }
        return c;
      });
      saveLocalClients(updated);
      return updated;
    });

    if (updatedFields.name || updatedFields.business) {
      setPayments(prev => {
        const updated = prev.map(p => {
          if (p.clientId === id) {
            const clientName = getClientDisplayName(updatedFields.name || p.clientName, updatedFields.business || p.business);
            return {
              ...p,
              clientName,
              business: updatedFields.business || p.business,
            };
          }
          return p;
        });
        saveLocalPayments(updated);
        return updated;
      });
    }

    try {
      if (updatedClientObj) {
        await supabase.from('clients').update(mapClientToDb(updatedClientObj)).eq('id', id);
      }
    } catch (err) {
      console.error('updateClient error:', err);
    }

    return true;
  };

  return (
    <PaymentContext.Provider
      value={{
        clients,
        payments,
        loading,
        isConnected,
        isLocalStorage,
        dbError,
        addClient,
        recordPayment,
        deletePayment,
        deleteClient,
        updateWebsiteStage,
        updatePayment,
        updateClient,
        refreshData: fetchAllData,
        resetToDemoData,
        resetPaymentsKeepClients,
        resetAllData,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePaymentData() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePaymentData must be used within a PaymentProvider');
  }
  return context;
}

