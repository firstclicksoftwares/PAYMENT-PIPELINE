import { useState } from 'react';
import { clients, payments, formatCurrency, formatDate, daysUntil } from '../data';
import StatusBadge from '../components/StatusBadge';
import type { PaymentStatus } from '../types';

const kpis = [
  {
    label: 'Total Clients',
    value: '6',
    sub: '2 new this month',
    icon: '👥',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    label: 'Total Collected',
    value: formatCurrency(61000),
    sub: '+₹20,000 this month',
    icon: '₹',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Total Due',
    value: formatCurrency(64000),
    sub: 'Across 5 clients',
    icon: '⏳',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    label: 'Due This Month',
    value: formatCurrency(22000),
    sub: '3 payments pending',
    icon: '📅',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    label: 'Overdue',
    value: formatCurrency(20000),
    sub: '2 clients overdue',
    icon: '⚠',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    label: 'Monthly Recurring',
    value: formatCurrency(29000),
    sub: 'Social + Maintenance',
    icon: '🔄',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
];

const pipelineStages = [
  { key: 'lead', label: 'Lead', clients: 0, amount: 0, color: 'bg-slate-700', text: 'text-slate-300' },
  { key: 'advance_received', label: 'Advance Received', clients: 2, amount: 20000, color: 'bg-violet-700', text: 'text-violet-200' },
  { key: 'work_in_progress', label: 'Work in Progress', clients: 1, amount: 18000, color: 'bg-indigo-700', text: 'text-indigo-200' },
  { key: 'payment_due', label: 'Payment Due', clients: 2, amount: 20000, color: 'bg-amber-700', text: 'text-amber-200' },
  { key: 'fully_paid', label: 'Fully Paid', clients: 1, amount: 12000, color: 'bg-emerald-700', text: 'text-emerald-200' },
];

const upcomingPayments = payments.filter(p => ['due', 'overdue', 'partially_paid'].includes(p.status));

interface Props {
  onRecordPayment: () => void;
}

export default function Dashboard({ onRecordPayment }: Props) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">September 2026 — Payment Overview</p>
        </div>
        <button
          onClick={onRecordPayment}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Record Payment
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="glass p-4 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center text-lg`}>
              {k.icon}
            </div>
            <div>
              <div className={`text-xl font-semibold font-mono-data ${k.color}`}>{k.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
              <div className="text-[11px] text-slate-600 mt-1">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="glass p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Payment Pipeline</h2>
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
      <div className="glass p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Upcoming Payments</h2>
          <span className="text-xs text-slate-500">{upcomingPayments.length} pending</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Client', 'Service', 'Type', 'Amount', 'Due Date', 'Status', 'Action'].map(h => (
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
                      <div className="font-medium text-white text-sm">{p.clientName}</div>
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
                      <div className={`text-[11px] mt-0.5 font-medium ${days < 0 ? 'text-red-400' : days === 0 ? 'text-amber-400' : days <= 7 ? 'text-yellow-400' : 'text-slate-500'}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
                      </div>
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
                        <button className="text-[11px] px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-md transition-colors">
                          Remind
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
