import { useState } from 'react';
import { clients, formatCurrency } from '../data';

interface Props {
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function RecordPaymentModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    clientId: '',
    paymentType: 'website_onetime',
    totalAmount: '',
    received: '',
    date: '2026-09-06',
    dueDate: '',
    method: 'upi',
    transactionId: '',
    notes: '',
  });

  const received = parseFloat(form.received) || 0;
  const total = parseFloat(form.totalAmount) || 0;
  const remaining = Math.max(0, total - received);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess('Payment recorded successfully');
    onClose();
  };

  const selectedClient = clients.find(c => c.id === form.clientId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-semibold text-white">Record Payment</h2>
            <p className="text-xs text-slate-500 mt-0.5">Log a new payment transaction</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Client */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Client</label>
            <select
              value={form.clientId}
              onChange={e => set('clientId', e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
            >
              <option value="">Select client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.business}</option>
              ))}
            </select>
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Payment Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'website_onetime', label: 'Website One-Time' },
                { value: 'website_maintenance', label: 'Maintenance' },
                { value: 'social_media', label: 'Social Media' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('paymentType', opt.value)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-colors ${form.paymentType === opt.value ? 'bg-violet-600 text-white' : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Total Amount (₹)</label>
              <input
                type="number"
                value={form.totalAmount}
                onChange={e => set('totalAmount', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 font-mono-data"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Amount Received (₹)</label>
              <input
                type="number"
                value={form.received}
                onChange={e => set('received', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 font-mono-data"
              />
            </div>
          </div>

          {/* Live Calculation */}
          {(total > 0 || received > 0) && (
            <div className="bg-gradient-to-r from-violet-600/10 to-transparent border border-violet-500/20 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Total</div>
                  <div className="text-lg font-semibold font-mono-data text-white">{formatCurrency(total)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Received</div>
                  <div className="text-lg font-semibold font-mono-data text-emerald-400">{formatCurrency(received)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Remaining</div>
                  <div className={`text-lg font-semibold font-mono-data ${remaining > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{formatCurrency(remaining)}</div>
                </div>
              </div>
              {total > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (received / total) * 100)}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1 text-right">{Math.min(100, Math.round((received / total) * 100))}% collected</div>
                </div>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Payment Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Next Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
                className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>

          {/* Method */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Payment Method</label>
            <div className="grid grid-cols-4 gap-2">
              {[['upi', 'UPI'], ['bank_transfer', 'Bank Transfer'], ['cash', 'Cash'], ['other', 'Other']].map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('method', v)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${form.method === v ? 'bg-indigo-600 text-white' : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Txn ID */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Transaction ID (optional)</label>
            <input
              type="text"
              value={form.transactionId}
              onChange={e => set('transactionId', e.target.value)}
              placeholder="UPI ref / NEFT ref..."
              className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 font-mono-data"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              placeholder="Additional notes..."
              className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-sm font-medium rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors">
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
