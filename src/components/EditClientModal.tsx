import React, { useState } from 'react';
import { usePaymentData } from '../context/PaymentContext';
import type { Client, ServiceType } from '../types';

interface Props {
  client: Client;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function EditClientModal({ client, onClose, onSuccess }: Props) {
  const { updateClient } = usePaymentData();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: client.name || '',
    business: client.business || '',
    phone: client.phone || '',
    email: client.email || '',
    service: client.service || 'website',

    // Website
    websiteProject: client.websiteProject || '',
    websiteTotal: client.websiteTotal ? client.websiteTotal.toString() : '',
    websiteAdvance: client.websiteAdvance ? client.websiteAdvance.toString() : '',
    websiteDueDate: client.websiteDueDate || '',

    // Maintenance
    maintenanceEnabled: !!client.maintenanceEnabled,
    maintenanceAmount: client.maintenanceAmount ? client.maintenanceAmount.toString() : '',
    maintenanceStartDate: client.maintenanceStartDate || '',
    maintenanceNextDue: client.maintenanceNextDue || '',

    // Social
    socialPackage: client.socialPackage || '',
    socialAmount: client.socialAmount ? client.socialAmount.toString() : '',
    socialAdvance: client.socialAdvance ? client.socialAdvance.toString() : '',
    socialNextDue: client.socialNextDue || '',
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const isWebsite = form.service === 'website' || form.service === 'both';
  const isSocial = form.service === 'social_media' || form.service === 'both';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.business.trim()) {
      setError('Client name and business name are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const websiteTotal = isWebsite ? (parseFloat(form.websiteTotal) || 0) : 0;
      const websiteAdvance = isWebsite ? (parseFloat(form.websiteAdvance) || 0) : 0;
      const maintenanceAmount = (isWebsite && form.maintenanceEnabled) ? (parseFloat(form.maintenanceAmount) || 0) : 0;

      const socialAmount = isSocial ? (parseFloat(form.socialAmount) || 0) : 0;
      const socialAdvance = isSocial ? (parseFloat(form.socialAdvance) || 0) : 0;
      const socialOutstanding = Math.max(0, socialAmount - socialAdvance);

      await updateClient(client.id, {
        name: form.name.trim(),
        business: form.business.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        service: form.service as ServiceType,

        // Website
        websiteProject: isWebsite ? form.websiteProject || 'Website Project' : undefined,
        websiteTotal: isWebsite ? websiteTotal : 0,
        websiteAdvance: isWebsite ? websiteAdvance : 0,
        websiteDueDate: isWebsite ? form.websiteDueDate : undefined,

        // Maintenance
        maintenanceEnabled: isWebsite ? form.maintenanceEnabled : false,
        maintenanceAmount: isWebsite && form.maintenanceEnabled ? maintenanceAmount : 0,
        maintenanceStartDate: isWebsite && form.maintenanceEnabled ? form.maintenanceStartDate : undefined,
        maintenanceNextDue: isWebsite && form.maintenanceEnabled ? (form.maintenanceNextDue || form.maintenanceStartDate) : undefined,

        // Social
        socialPackage: isSocial ? form.socialPackage || 'Monthly Package' : undefined,
        socialAmount: isSocial ? socialAmount : 0,
        socialAdvance: isSocial ? socialAdvance : 0,
        socialOutstanding: isSocial ? socialOutstanding : 0,
        socialNextDue: isSocial ? form.socialNextDue : undefined,
      });

      onSuccess(`Client "${form.name}" updated successfully!`);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update client');
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
            <h2 className="text-lg font-semibold text-white">✏ Edit Client Details</h2>
            <p className="text-xs text-slate-400 mt-0.5">Update account information & service packages</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">✕</button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Client Details */}
          <div className="space-y-4">
            <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Client Information</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Full Name *</label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Business Name *</label>
                <input
                  value={form.business}
                  onChange={e => set('business', e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Phone</label>
                <input
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Service Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'website', label: 'Website' },
                { value: 'social_media', label: 'Social Media' },
                { value: 'both', label: 'Both Services' },
              ].map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set('service', s.value)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${form.service === s.value ? 'bg-violet-600 text-white' : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Website Section */}
          {isWebsite && (
            <div className="glass p-4 rounded-xl border border-white/[0.06] space-y-4">
              <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider">Website Project Setup</div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Project Name</label>
                <input
                  value={form.websiteProject}
                  onChange={e => set('websiteProject', e.target.value)}
                  placeholder="Website Redesign"
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Total Amount (₹)</label>
                  <input
                    type="number"
                    value={form.websiteTotal}
                    onChange={e => set('websiteTotal', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 font-mono-data focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Advance (₹)</label>
                  <input
                    type="number"
                    value={form.websiteAdvance}
                    onChange={e => set('websiteAdvance', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 font-mono-data focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Balance Due Date</label>
                <input
                  type="date"
                  value={form.websiteDueDate}
                  onChange={e => set('websiteDueDate', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              {/* Maintenance Toggle */}
              <div className="pt-2 border-t border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Enable Monthly Maintenance?</span>
                  <button
                    type="button"
                    onClick={() => set('maintenanceEnabled', !form.maintenanceEnabled)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${form.maintenanceEnabled ? 'bg-violet-600' : 'bg-white/[0.12]'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.maintenanceEnabled ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
                {form.maintenanceEnabled && (
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Monthly Fee (₹)</label>
                      <input
                        type="number"
                        value={form.maintenanceAmount}
                        onChange={e => set('maintenanceAmount', e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 font-mono-data focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Next Due Date</label>
                      <input
                        type="date"
                        value={form.maintenanceNextDue}
                        onChange={e => set('maintenanceNextDue', e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Section */}
          {isSocial && (
            <div className="glass p-4 rounded-xl border border-white/[0.06] space-y-4">
              <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Social Media Retainer Setup</div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Package Name</label>
                <input
                  value={form.socialPackage}
                  onChange={e => set('socialPackage', e.target.value)}
                  placeholder="Monthly Retainer"
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Monthly Amount (₹)</label>
                  <input
                    type="number"
                    value={form.socialAmount}
                    onChange={e => set('socialAmount', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 font-mono-data focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Advance Collected (₹)</label>
                  <input
                    type="number"
                    value={form.socialAdvance}
                    onChange={e => set('socialAdvance', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 font-mono-data focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Next Payment Due Date</label>
                <input
                  type="date"
                  value={form.socialNextDue}
                  onChange={e => set('socialNextDue', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-sm font-medium rounded-lg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? 'Saving...' : '✓ Update Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
