import React, { useState } from 'react';
import { usePaymentData } from '../context/PaymentContext';
import { formatCurrency, getClientDisplayName } from '../data';
import type { PaymentType, PaymentMethod, PaymentStatus, ServiceType } from '../types';

interface Props {
  onClose: () => void;
  onSuccess: (msg: string) => void;
  initialClientId?: string;
  onAddClient?: () => void;
}

export default function AddDueModal({ onClose, onSuccess, initialClientId, onAddClient }: Props) {
  const { clients, recordPayment } = usePaymentData();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultClientId = initialClientId || clients[0]?.id || '';
  const defaultClient = clients.find(c => c.id === defaultClientId);

  // Set default due date to 30 days from now or next month
  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    clientId: defaultClientId,
    paymentType: (defaultClient?.service === 'social_media' ? 'social_media' : 'website_onetime') as PaymentType,
    totalAmount: defaultClient ? (defaultClient.socialAmount || defaultClient.maintenanceAmount || defaultClient.websiteTotal || 0).toString() : '',
    advanceReceived: '0',
    dueDate: defaultDueDate,
    notes: '',
  });

  const total = parseFloat(form.totalAmount) || 0;
  const advance = parseFloat(form.advanceReceived) || 0;
  const remaining = Math.max(0, total - advance);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleClientChange = (cId: string) => {
    const client = clients.find(c => c.id === cId);
    const autoType: PaymentType = client?.service === 'social_media' ? 'social_media' : 'website_onetime';
    const autoAmount = client
      ? (client.service === 'social_media' ? (client.socialAmount || 0) : (client.websiteTotal || 0))
      : 0;

    setForm(f => ({
      ...f,
      clientId: cId,
      paymentType: autoType,
      totalAmount: autoAmount ? autoAmount.toString() : '',
    }));
  };

  const handleTypeChange = (type: PaymentType) => {
    const client = clients.find(c => c.id === form.clientId);
    let autoAmount = 0;
    if (client) {
      if (type === 'social_media') autoAmount = client.socialAmount || 0;
      else if (type === 'website_maintenance') autoAmount = client.maintenanceAmount || 0;
      else autoAmount = client.websiteTotal || 0;
    }

    setForm(f => ({
      ...f,
      paymentType: type,
      totalAmount: autoAmount ? autoAmount.toString() : f.totalAmount,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId && clients.length > 0) {
      setError('Please select a client');
      return;
    }
    if (total <= 0) {
      setError('Please enter a valid due amount');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const client = clients.find(c => c.id === form.clientId);
      const status: PaymentStatus =
        remaining === 0 && advance > 0
          ? 'paid'
          : advance > 0
          ? 'partially_paid'
          : 'due';

      const service: ServiceType = form.paymentType === 'social_media' ? 'social_media' : 'website';

      await recordPayment({
        clientId: form.clientId,
        clientName: getClientDisplayName(client?.name || 'Client', client?.business),
        business: client?.business || 'Client',
        service,
        paymentType: form.paymentType,
        totalAmount: total,
        received: advance,
        remaining,
        date: new Date().toISOString().split('T')[0],
        dueDate: form.dueDate,
        method: 'upi' as PaymentMethod,
        status,
        notes: form.notes || `${form.paymentType === 'social_media' ? 'Social Retainer' : form.paymentType === 'website_maintenance' ? 'Maintenance' : 'Website'} Due Added`,
      });

      onSuccess(`New billing due of ${formatCurrency(total)} added for ${client?.name || 'Client'}!`);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add billing due');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass rounded-2xl overflow-hidden border border-white/[0.08]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-semibold text-white">📌 Add New Billing Due</h2>
            <p className="text-xs text-slate-400 mt-0.5">Creates a new pending due / upcoming invoice for a client</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">✕</button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Client Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Select Client *</label>
            <select
              value={form.clientId}
              onChange={e => handleClientChange(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
            >
              <option value="" className="bg-[#12121f]">Select client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-[#12121f]">
                  {getClientDisplayName(c.name, c.business)}
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <div className="mt-2.5 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-lg flex items-center justify-between">
                <span>No clients registered yet.</span>
                {onAddClient && (
                  <button
                    type="button"
                    onClick={() => { onClose(); onAddClient(); }}
                    className="ml-2 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold shrink-0"
                  >
                    + Add Client
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment / Due Type */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Service Category</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'social_media', label: 'Social Media' },
                { value: 'website_onetime', label: 'Website Project' },
                { value: 'website_maintenance', label: 'Maintenance' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleTypeChange(opt.value as PaymentType)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-colors ${form.paymentType === opt.value ? 'bg-amber-600 text-white font-semibold' : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Due Amount (₹) *</label>
              <input
                type="number"
                value={form.totalAmount}
                onChange={e => set('totalAmount', e.target.value)}
                placeholder="5000"
                required
                className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 font-mono-data"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Advance Received Now (₹)</label>
              <input
                type="number"
                value={form.advanceReceived}
                onChange={e => set('advanceReceived', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 font-mono-data"
              />
            </div>
          </div>

          {/* Balance Preview */}
          {total > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs">
              <span className="text-amber-300 font-medium">Pending Remaining Balance:</span>
              <span className="text-lg font-bold font-mono-data text-amber-400">{formatCurrency(remaining)}</span>
            </div>
          )}

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Payment Due Date *</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => set('dueDate', e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Description / Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="e.g. October 2026 Retainer Bill"
              className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-sm font-medium rounded-lg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
            >
              {submitting ? 'Creating...' : '✓ Add Due Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
