import { useState } from 'react';

interface Props {
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

type ServiceType = 'website' | 'social_media' | 'both';

const STEPS = ['Client Details', 'Select Service', 'Payment Structure', 'Review'];

export default function AddClientModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    business: '',
    phone: '',
    email: '',
    service: '' as ServiceType | '',
    // Website
    websiteProject: '',
    websiteTotal: '',
    websiteAdvance: '',
    websiteDueDate: '',
    maintenanceEnabled: false,
    maintenanceAmount: '',
    maintenanceStartDate: '',
    // Social
    socialPackage: '',
    socialAmount: '',
    socialAdvance: '',
    socialDueDate: '',
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const websiteRemaining = (parseFloat(form.websiteTotal) || 0) - (parseFloat(form.websiteAdvance) || 0);
  const isWebsite = form.service === 'website' || form.service === 'both';
  const isSocial = form.service === 'social_media' || form.service === 'both';

  const canNext = [
    form.name && form.business && form.phone && form.email,
    form.service !== '',
    true,
    true,
  ][step];

  const handleSubmit = () => {
    onSuccess(`Client "${form.name}" added successfully`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Add New Client</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">✕</button>
          </div>
          {/* Step Indicator */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                    ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-violet-600 text-white' : 'bg-white/[0.08] text-slate-500'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <div className={`text-[9px] mt-1 font-medium whitespace-nowrap ${i === step ? 'text-violet-300' : 'text-slate-600'}`}>{s}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 mx-1 mt-[-14px] ${i < step ? 'bg-emerald-500' : 'bg-white/[0.08]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
          {/* Step 0: Client Details */}
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Arjun Mehta" className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Business Name *</label>
                  <input value={form.business} onChange={e => set('business', e.target.value)} placeholder="TechStar Solutions" className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Phone *</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Email *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="client@example.com" className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50" />
                </div>
              </div>
            </>
          )}

          {/* Step 1: Select Service */}
          {step === 1 && (
            <div className="grid grid-cols-1 gap-3">
              {([
                { value: 'website', label: 'Website', desc: 'One-time project + optional monthly maintenance', icon: '🖥', color: 'border-violet-600 bg-violet-600/10' },
                { value: 'social_media', label: 'Social Media', desc: 'Monthly recurring management package', icon: '📱', color: 'border-cyan-600 bg-cyan-600/10' },
                { value: 'both', label: 'Website + Social Media', desc: 'Full service — website and social media management', icon: '⚡', color: 'border-indigo-600 bg-indigo-600/10' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('service', opt.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${form.service === opt.value ? opt.color : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <div className="font-semibold text-white">{opt.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                    </div>
                    {form.service === opt.value && <span className="ml-auto text-emerald-400 text-lg">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Payment Structure */}
          {step === 2 && (
            <>
              {isWebsite && (
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-violet-300 uppercase tracking-wide">Website Payment</div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Project Name</label>
                    <input value={form.websiteProject} onChange={e => set('websiteProject', e.target.value)} placeholder="Corporate Website Redesign" className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Total Amount (₹)</label>
                      <input type="number" value={form.websiteTotal} onChange={e => set('websiteTotal', e.target.value)} placeholder="15000" className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 font-mono-data" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Advance (₹)</label>
                      <input type="number" value={form.websiteAdvance} onChange={e => set('websiteAdvance', e.target.value)} placeholder="5000" className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 font-mono-data" />
                    </div>
                  </div>
                  {(parseFloat(form.websiteTotal) > 0) && (
                    <div className="text-xs text-amber-400 font-mono-data">Balance: ₹{websiteRemaining.toLocaleString('en-IN')}</div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Balance Due Date</label>
                    <input type="date" value={form.websiteDueDate} onChange={e => set('websiteDueDate', e.target.value)} className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                    <span className="text-sm text-slate-300">Enable Monthly Maintenance?</span>
                    <button
                      type="button"
                      onClick={() => set('maintenanceEnabled', !form.maintenanceEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${form.maintenanceEnabled ? 'bg-violet-600' : 'bg-white/[0.12]'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.maintenanceEnabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {form.maintenanceEnabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Monthly Amount (₹)</label>
                        <input type="number" value={form.maintenanceAmount} onChange={e => set('maintenanceAmount', e.target.value)} placeholder="1000" className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 font-mono-data" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Start Date</label>
                        <input type="date" value={form.maintenanceStartDate} onChange={e => set('maintenanceStartDate', e.target.value)} className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isWebsite && isSocial && <div className="border-t border-white/[0.06]" />}

              {isSocial && (
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-cyan-300 uppercase tracking-wide">Social Media Package</div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Package Name</label>
                    <input value={form.socialPackage} onChange={e => set('socialPackage', e.target.value)} placeholder="Growth Package" className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Monthly Amount (₹)</label>
                      <input type="number" value={form.socialAmount} onChange={e => set('socialAmount', e.target.value)} placeholder="7000" className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 font-mono-data" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Advance Collected (₹)</label>
                      <input type="number" value={form.socialAdvance} onChange={e => set('socialAdvance', e.target.value)} placeholder="3000" className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 font-mono-data" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Current Billing Due Date</label>
                    <input type="date" value={form.socialDueDate} onChange={e => set('socialDueDate', e.target.value)} className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500/50" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="glass p-4 space-y-2 text-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Client Details</div>
                {[['Name', form.name], ['Business', form.business], ['Phone', form.phone], ['Email', form.email]].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-slate-500">{l}</span>
                    <span className="text-slate-200">{v || '—'}</span>
                  </div>
                ))}
              </div>

              {isWebsite && (
                <div className="glass p-4 space-y-2 text-sm">
                  <div className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-3">Website</div>
                  {[
                    ['Project', form.websiteProject],
                    ['Total', form.websiteTotal ? `₹${parseFloat(form.websiteTotal).toLocaleString('en-IN')}` : '—'],
                    ['Advance', form.websiteAdvance ? `₹${parseFloat(form.websiteAdvance).toLocaleString('en-IN')}` : '—'],
                    ['Balance', `₹${websiteRemaining.toLocaleString('en-IN')}`],
                    ...(form.maintenanceEnabled ? [['Maintenance', `₹${form.maintenanceAmount}/month`]] : []),
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-slate-500">{l}</span>
                      <span className="text-slate-200">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {isSocial && (
                <div className="glass p-4 space-y-2 text-sm">
                  <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-3">Social Media</div>
                  {[
                    ['Package', form.socialPackage],
                    ['Monthly', form.socialAmount ? `₹${parseFloat(form.socialAmount).toLocaleString('en-IN')}` : '—'],
                    ['Advance', form.socialAdvance ? `₹${parseFloat(form.socialAdvance).toLocaleString('en-IN')}` : '—'],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-slate-500">{l}</span>
                      <span className="text-slate-200">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext}
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              ✓ Create Client
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
