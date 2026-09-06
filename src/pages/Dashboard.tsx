import React from 'react';
import { usePaymentData } from '../context/PaymentContext';
import { formatCurrency, formatDate, daysUntil, getClientDisplayName, isCurrentCalendarMonth } from '../data';
import StatusBadge from '../components/StatusBadge';

import type { Payment } from '../types';

interface Props {
  onRecordPayment: () => void;
  onEditPayment?: (payment: Payment) => void;
  onAddDue?: () => void;
}

function getClientStage(c: any): 'lead' | 'advance_received' | 'work_in_progress' | 'payment_due' | 'fully_paid' {
  if (c.websiteStage) {
    if (c.websiteStage === 'advance_received' && (!c.websiteAdvance || c.websiteAdvance === 0)) {
      return (c.websiteTotal || 0) > 0 ? 'payment_due' : 'lead';
    }
    return c.websiteStage;
  }
  if (c.overallStatus === 'paid') return 'fully_paid';
  if (c.overallStatus === 'overdue' || c.overallStatus === 'due') return 'payment_due';
  if ((c.totalPaid || 0) > 0 && (c.totalDue || 0) > 0) return 'advance_received';
  if ((c.totalPaid || 0) > 0 && (c.totalDue || 0) === 0) return 'fully_paid';
  return 'lead';
}

function getStageAmount(c: any, stage: string): number {
  if (stage === 'fully_paid') return c.totalPaid || c.totalContractValue || 0;
  if (stage === 'payment_due') return Math.max(0, (c.websiteTotal || 0) - (c.websiteAdvance || 0)) || c.totalDue || 0;
  if (stage === 'advance_received') return c.websiteAdvance || c.totalPaid || 0;
  if (stage === 'work_in_progress') return c.websiteTotal || c.totalContractValue || 0;
  return c.websiteTotal || c.totalContractValue || 0;
}

export default function Dashboard({ onRecordPayment, onEditPayment, onAddDue }: Props) {
  const { clients, payments, loading, deletePayment } = usePaymentData();

  // Dynamic KPI calculations from realtime Supabase data
  const totalClients = clients.length;
  const totalCollected = payments.reduce((sum, p) => sum + (p.received || 0), 0);
  const totalDue = clients.reduce((sum, c) => sum + (c.totalDue || 0), 0);

  // Due this month (in current calendar month)
  const dueThisMonth = payments
    .filter(p => p.status !== 'paid' && p.remaining > 0 && isCurrentCalendarMonth(p.dueDate))
    .reduce((sum, p) => sum + (p.remaining || 0), 0);

  // Overdue
  const overdueTotal = payments
    .filter(p => p.status === 'overdue' || (p.status !== 'paid' && p.dueDate && daysUntil(p.dueDate) < 0))
    .reduce((sum, p) => sum + (p.remaining || 0), 0);

  // Monthly Recurring (Social + Maintenance)
  const monthlyRecurring = clients.reduce((sum, c) => {
    let rec = 0;
    if (c.service === 'social_media' || c.service === 'both') {
      rec += c.socialAmount || 0;
    }
    if (c.maintenanceEnabled) {
      rec += c.maintenanceAmount || 0;
    }
    return sum + rec;
  }, 0);

  const kpis = [
    {
      label: 'Total Clients',
      value: totalClients.toString(),
      sub: `${totalClients} registered`,
      icon: '👥',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Total Collected',
      value: formatCurrency(totalCollected),
      sub: `${payments.filter(p => p.received > 0).length} payments logged`,
      icon: '₹',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Total Due',
      value: formatCurrency(totalDue),
      sub: `Across ${clients.filter(c => (c.totalDue || 0) > 0).length} clients`,
      icon: '⏳',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Due This Month',
      value: formatCurrency(dueThisMonth),
      sub: `${payments.filter(p => p.status !== 'paid' && p.remaining > 0 && isCurrentCalendarMonth(p.dueDate)).length} pending`,
      icon: '📅',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Overdue',
      value: formatCurrency(overdueTotal),
      sub: `${payments.filter(p => p.status !== 'paid' && p.dueDate && daysUntil(p.dueDate) < 0).length} overdue items`,
      icon: '⚠',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Monthly Recurring',
      value: formatCurrency(monthlyRecurring),
      sub: 'Social + Maintenance',
      icon: '🔄',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
  ];

  // Dynamic Pipeline stages for active website clients
  const websiteClients = clients.filter(c => c.service === 'website' || c.service === 'both');
  const pipelineStages = [
    {
      key: 'lead',
      label: 'Lead',
      clients: websiteClients.filter(c => getClientStage(c) === 'lead').length,
      amount: websiteClients.filter(c => getClientStage(c) === 'lead').reduce((s, c) => s + getStageAmount(c, 'lead'), 0),
      color: 'bg-slate-700/60',
      text: 'text-slate-300',
    },
    {
      key: 'advance_received',
      label: 'Advance Received',
      clients: websiteClients.filter(c => getClientStage(c) === 'advance_received').length,
      amount: websiteClients.filter(c => getClientStage(c) === 'advance_received').reduce((s, c) => s + getStageAmount(c, 'advance_received'), 0),
      color: 'bg-violet-700/60',
      text: 'text-violet-200',
    },
    {
      key: 'work_in_progress',
      label: 'Work in Progress',
      clients: websiteClients.filter(c => getClientStage(c) === 'work_in_progress').length,
      amount: websiteClients.filter(c => getClientStage(c) === 'work_in_progress').reduce((s, c) => s + getStageAmount(c, 'work_in_progress'), 0),
      color: 'bg-indigo-700/60',
      text: 'text-indigo-200',
    },
    {
      key: 'payment_due',
      label: 'Payment Due',
      clients: websiteClients.filter(c => getClientStage(c) === 'payment_due').length,
      amount: websiteClients.filter(c => getClientStage(c) === 'payment_due').reduce((s, c) => s + getStageAmount(c, 'payment_due'), 0),
      color: 'bg-amber-700/60',
      text: 'text-amber-200',
    },
    {
      key: 'fully_paid',
      label: 'Fully Paid',
      clients: websiteClients.filter(c => getClientStage(c) === 'fully_paid').length,
      amount: websiteClients.filter(c => getClientStage(c) === 'fully_paid').reduce((s, c) => s + getStageAmount(c, 'fully_paid'), 0),
      color: 'bg-emerald-700/60',
      text: 'text-emerald-200',
    },
  ];

  const upcomingPayments = payments.filter(p => ['due', 'overdue', 'partially_paid'].includes(p.status) || p.remaining > 0);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Connecting to Supabase Realtime...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Live Agency Financial & Payment Overview</p>
        </div>
        <div className="flex items-center gap-3">
          {onAddDue && (
            <button
              onClick={onAddDue}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-sm font-medium rounded-lg transition-colors border border-amber-500/30"
            >
              📌 + Add Due / Bill
            </button>
          )}
          <button
            onClick={onRecordPayment}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-violet-600/20"
          >
            + Record Payment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="glass p-4 flex flex-col gap-3 rounded-xl border border-white/[0.06]">
            <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center text-lg`}>
              {k.icon}
            </div>
            <div>
              <div className={`text-xl font-semibold font-mono-data ${k.color}`}>{k.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
              <div className="text-[11px] text-slate-600 mt-1">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="glass p-5 rounded-xl border border-white/[0.06]">
        <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Website Projects Pipeline</h2>
        <div className="flex gap-1">
          {pipelineStages.map((stage, i) => (
            <div
              key={stage.key}
              className={`flex-1 ${stage.color} ${i === 0 ? 'rounded-l-lg' : ''} ${i === pipelineStages.length - 1 ? 'rounded-r-lg' : ''} p-3 min-w-0`}
            >
              <div className={`text-[10px] font-medium uppercase tracking-wide opacity-80 ${stage.text} truncate`}>{stage.label}</div>
              <div className={`text-lg font-semibold font-mono-data mt-1 ${stage.text}`}>{stage.clients}</div>
              <div className={`text-xs ${stage.text} opacity-70`}>{formatCurrency(stage.amount)}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-1">
          {pipelineStages.map(s => (
            <div key={s.key} className="flex-1 text-center text-[9px] text-slate-600 uppercase tracking-wide truncate px-1">{s.label}</div>
          ))}
        </div>
      </div>

      {/* Upcoming Payments Table */}
      <div className="glass p-5 rounded-xl border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Upcoming & Pending Payments</h2>
          <span className="text-xs text-slate-500 font-mono-data">{upcomingPayments.length} pending</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Client', 'Service', 'Type', 'Amount Due', 'Due Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 pb-3 pr-4 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {upcomingPayments.map(p => {
                const days = daysUntil(p.dueDate);
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-white text-sm">{getClientDisplayName(p.clientName, p.business)}</div>
                      <div className="text-xs text-slate-500">{p.business}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.service === 'website' ? 'bg-violet-500/15 text-violet-300' : 'bg-cyan-500/15 text-cyan-300'}`}>
                        {p.service === 'website' ? 'Website' : 'Social'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-400">
                      {p.paymentType === 'website_onetime' ? 'One-Time' : p.paymentType === 'website_maintenance' ? 'Maintenance' : 'Monthly'}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-mono-data text-white font-medium">{formatCurrency(p.remaining)}</div>
                      <div className="text-xs text-slate-500">of {formatCurrency(p.totalAmount)}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-sm text-slate-200">{formatDate(p.dueDate)}</div>
                      {p.dueDate && (
                        <div className={`text-[11px] mt-0.5 font-medium ${days < 0 ? 'text-red-400' : days === 0 ? 'text-amber-400' : days <= 7 ? 'text-yellow-400' : 'text-slate-500'}`}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={onRecordPayment}
                          className="text-[11px] px-2.5 py-1 bg-violet-600/80 hover:bg-violet-500 text-white rounded-md transition-colors"
                        >
                          Record
                        </button>
                        <button
                          onClick={() => onEditPayment && onEditPayment(p)}
                          className="text-[11px] px-2 py-1 bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 border border-white/[0.1] rounded-md transition-colors font-medium"
                          title="Edit Payment Record"
                        >
                          ✏ Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete payment entry for "${getClientDisplayName(p.clientName, p.business)}"?`)) {
                              deletePayment(p.id);
                            }
                          }}
                          className="text-[11px] px-2 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-md transition-colors font-medium"
                          title="Delete Payment Record"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {upcomingPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-600">
                    No pending dues. All payments are clear or no records added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
