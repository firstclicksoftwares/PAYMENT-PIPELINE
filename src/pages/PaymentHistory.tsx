import { useState } from 'react';
import { payments, formatCurrency, formatDate } from '../data';
import StatusBadge from '../components/StatusBadge';

const methodLabel: Record<string, string> = {
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
  other: 'Other',
};

export default function PaymentHistory() {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = payments.filter(p => {
    const matchSearch = search === '' ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.business.toLowerCase().includes(search.toLowerCase()) ||
      (p.transactionId || '').toLowerCase().includes(search.toLowerCase());
    const matchService = serviceFilter === 'all' || p.service === serviceFilter;
    const matchType = typeFilter === 'all' || p.paymentType === typeFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchService && matchType && matchStatus;
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Payment History</h1>
        <p className="text-sm text-slate-500 mt-0.5">{payments.length} payment records</p>
      </div>

      {/* Filters */}
      <div className="glass p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search client, transaction ID..."
            className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        {/* Service */}
        <div className="flex gap-1.5">
          {[['all', 'All Services'], ['website', 'Website'], ['social_media', 'Social Media']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setServiceFilter(v)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${serviceFilter === v ? 'bg-violet-600 text-white' : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'}`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Type */}
        <div className="flex gap-1.5">
          {[['all', 'All Types'], ['website_onetime', 'One-Time'], ['website_maintenance', 'Maintenance'], ['social_media', 'Monthly']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setTypeFilter(v)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${typeFilter === v ? 'bg-indigo-600 text-white' : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'}`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex gap-1.5">
          {[['all', 'All'], ['paid', 'Paid'], ['partially_paid', 'Partial'], ['due', 'Due'], ['overdue', 'Overdue']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${statusFilter === v ? 'bg-emerald-700 text-white' : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <span className="text-xs text-slate-500">{filtered.length} records</span>
          <span className="text-xs font-mono-data text-emerald-400">
            Total Collected: {formatCurrency(filtered.reduce((s, p) => s + p.received, 0))}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Date', 'Client', 'Service', 'Type', 'Total', 'Received', 'Remaining', 'Method', 'Txn ID', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 px-5 py-3 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDate(p.date)}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-white whitespace-nowrap">{p.clientName}</div>
                    <div className="text-xs text-slate-500">{p.business}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.service === 'website' ? 'bg-violet-500/15 text-violet-300' : 'bg-cyan-500/15 text-cyan-300'}`}>
                      {p.service === 'website' ? 'Website' : 'Social'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {p.paymentType === 'website_onetime' ? 'One-Time' : p.paymentType === 'website_maintenance' ? 'Maintenance' : 'Monthly'}
                  </td>
                  <td className="px-5 py-3 font-mono-data text-slate-200 whitespace-nowrap">{formatCurrency(p.totalAmount)}</td>
                  <td className="px-5 py-3 font-mono-data text-emerald-400 whitespace-nowrap">{formatCurrency(p.received)}</td>
                  <td className="px-5 py-3 font-mono-data whitespace-nowrap">
                    <span className={p.remaining > 0 ? 'text-amber-400' : 'text-slate-600'}>{formatCurrency(p.remaining)}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{methodLabel[p.method]}</td>
                  <td className="px-5 py-3 font-mono-data text-xs text-slate-500 whitespace-nowrap">{p.transactionId || '—'}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} size="sm" /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-slate-600">No payments match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
