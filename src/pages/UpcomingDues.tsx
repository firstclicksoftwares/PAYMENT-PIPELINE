import React from 'react';
import { usePaymentData } from '../context/PaymentContext';
import { formatCurrency, formatDate, daysUntil, getClientDisplayName, isCurrentCalendarMonth } from '../data';
import StatusBadge from '../components/StatusBadge';

const groups = [
  {
    key: 'overdue',
    label: 'Overdue',
    color: 'text-red-400',
    headerBg: 'bg-red-500/10 border-red-500/20',
    filter: (days: number) => days < 0,
  },
  {
    key: 'today',
    label: 'Due Today',
    color: 'text-amber-400',
    headerBg: 'bg-amber-500/10 border-amber-500/20',
    filter: (days: number) => days === 0,
  },
  {
    key: 'week',
    label: 'Due This Week',
    color: 'text-yellow-400',
    headerBg: 'bg-yellow-500/10 border-yellow-500/20',
    filter: (days: number) => days > 0 && days <= 7,
  },
  {
    key: 'month',
    label: 'Due This Month',
    color: 'text-violet-400',
    headerBg: 'bg-violet-500/10 border-violet-500/20',
    filter: (days: number, dateStr?: string) => days > 7 && isCurrentCalendarMonth(dateStr),
  },
  {
    key: 'next_month',
    label: 'Due Next Month & Future',
    color: 'text-cyan-400',
    headerBg: 'bg-cyan-500/10 border-cyan-500/20',
    filter: (days: number, dateStr?: string) => days > 0 && !isCurrentCalendarMonth(dateStr),
  },
];

import type { Payment } from '../types';

interface Props {
  onRecordPayment: () => void;
  onEditPayment?: (payment: Payment) => void;
  onAddDue?: () => void;
}

export default function UpcomingDues({ onRecordPayment, onEditPayment, onAddDue }: Props) {
  const { payments, deletePayment } = usePaymentData();
  const pendingPayments = payments.filter(p => p.status !== 'paid' && (p.remaining > 0 || p.dueDate));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Upcoming Dues</h1>
          <p className="text-sm text-slate-500 mt-0.5">All pending and upcoming payments tracked from database</p>
        </div>
        {onAddDue && (
          <button
            onClick={onAddDue}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-sm font-medium rounded-lg transition-colors border border-amber-500/30"
          >
            📌 + Add Due / Bill
          </button>
        )}
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {groups.map(g => {
          const items = pendingPayments.filter(p => p.dueDate && g.filter(daysUntil(p.dueDate), p.dueDate));
          const count = items.length;
          const total = items.reduce((s, p) => s + (p.remaining || 0), 0);
          return (
            <div key={g.key} className={`glass p-4 border rounded-xl ${g.headerBg}`}>
              <div className={`text-lg font-semibold font-mono-data ${g.color}`}>{count}</div>
              <div className="text-xs text-slate-400 mt-0.5">{g.label}</div>
              <div className={`text-sm font-mono-data mt-2 ${g.color}`}>{formatCurrency(total)}</div>
            </div>
          );
        })}
      </div>

      {/* Grouped Lists */}
      {groups.map(g => {
        const items = pendingPayments.filter(p => p.dueDate && g.filter(daysUntil(p.dueDate), p.dueDate));
        if (items.length === 0) return null;
        return (
          <div key={g.key} className="glass overflow-hidden rounded-xl border border-white/[0.06]">
            <div className={`px-5 py-3 border-b border-white/[0.06] flex items-center gap-2 ${g.headerBg}`}>
              <span className={`text-sm font-semibold ${g.color}`}>{g.label}</span>
              <span className={`text-xs font-mono-data ${g.color} opacity-70`}>({items.length})</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {['Client', 'Service', 'Amount Due', 'Due Date', 'Days', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-600 px-5 py-2.5 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {items.map(p => {
                  const days = daysUntil(p.dueDate);
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-white">{getClientDisplayName(p.clientName, p.business)}</div>
                        <div className="text-xs text-slate-500">{p.business}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.service === 'website' ? 'bg-violet-500/15 text-violet-300' : 'bg-cyan-500/15 text-cyan-300'}`}>
                          {p.service === 'website' ? 'Website' : 'Social'}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono-data font-medium text-white">{formatCurrency(p.remaining)}</td>
                      <td className="px-5 py-3 text-slate-300 text-xs">{formatDate(p.dueDate)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium font-mono-data ${days < 0 ? 'text-red-400' : days === 0 ? 'text-amber-400' : days <= 7 ? 'text-yellow-400' : 'text-slate-400'}`}>
                          {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? 'Today' : `${days}d`}
                        </span>
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} size="sm" /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={onRecordPayment}
                            className="text-[11px] px-2.5 py-1 bg-violet-600/80 hover:bg-violet-500 text-white rounded-md transition-colors whitespace-nowrap"
                          >
                            Record
                          </button>
                          <button
                            onClick={() => onEditPayment && onEditPayment(p)}
                            className="text-[11px] px-2 py-1 bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 border border-white/[0.1] rounded-md transition-colors font-medium whitespace-nowrap"
                            title="Edit Payment Record"
                          >
                            ✏ Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete pending payment record for "${getClientDisplayName(p.clientName, p.business)}"?`)) {
                                deletePayment(p.id);
                              }
                            }}
                            className="text-[11px] px-2 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-md transition-colors font-medium whitespace-nowrap"
                            title="Delete Record"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {pendingPayments.length === 0 && (
        <div className="glass p-12 text-center text-slate-600 rounded-xl border border-white/[0.06]">
          No upcoming dues or pending payments in database.
        </div>
      )}
    </div>
  );
}
