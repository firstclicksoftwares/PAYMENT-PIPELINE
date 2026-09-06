import { useState } from 'react';
import { clients, payments, formatCurrency, formatDate } from '../data';
import StatusBadge from '../components/StatusBadge';

const websiteStages = [
  { key: 'lead', label: 'Lead', color: 'border-slate-600 bg-slate-800/40', dot: 'bg-slate-500' },
  { key: 'advance_received', label: 'Advance Received', color: 'border-violet-600/50 bg-violet-900/20', dot: 'bg-violet-500' },
  { key: 'work_in_progress', label: 'Work in Progress', color: 'border-indigo-600/50 bg-indigo-900/20', dot: 'bg-indigo-500' },
  { key: 'payment_due', label: 'Payment Due', color: 'border-amber-600/50 bg-amber-900/20', dot: 'bg-amber-500' },
  { key: 'fully_paid', label: 'Fully Paid', color: 'border-emerald-600/50 bg-emerald-900/20', dot: 'bg-emerald-500' },
];

function WebsitePipeline({ onRecordPayment }: { onRecordPayment: () => void }) {
  const websiteClients = clients.filter(c => c.service === 'website' || c.service === 'both');

  return (
    <div className="space-y-6">
      {/* Pipeline Board */}
      <div className="grid grid-cols-5 gap-3">
        {websiteStages.map(stage => {
          const stageClients = websiteClients.filter(c => c.websiteStage === stage.key);
          return (
            <div key={stage.key} className={`border rounded-xl p-3 min-h-48 ${stage.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                <span className="text-xs font-medium text-slate-300">{stage.label}</span>
                <span className="ml-auto text-xs text-slate-500 font-mono-data">{stageClients.length}</span>
              </div>
              <div className="space-y-2">
                {stageClients.map(c => (
                  <div key={c.id} className="bg-[#0e0e1a]/80 border border-white/[0.07] rounded-lg p-3">
                    <div className="text-sm font-medium text-white">{c.name}</div>
                    <div className="text-xs text-slate-500 mb-2">{c.websiteProject}</div>
                    <div className="text-xs font-mono-data text-amber-400">{formatCurrency((c.websiteTotal || 0) - (c.websiteAdvance || 0))} due</div>
                    {c.websiteDueDate && <div className="text-[10px] text-slate-600 mt-1">{formatDate(c.websiteDueDate)}</div>}
                  </div>
                ))}
                {stageClients.length === 0 && (
                  <div className="text-center py-6 text-slate-700 text-xs">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Website Client Detail Table */}
      <div className="glass p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">All Website Clients</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Client', 'Project', 'Total', 'Advance', 'Remaining', 'Due Date', 'Stage', 'Maintenance', 'Action'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 pb-3 pr-4 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {websiteClients.map(c => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-white">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.business}</div>
                  </td>
                  <td className="py-3 pr-4 text-slate-400 text-xs max-w-32 truncate">{c.websiteProject}</td>
                  <td className="py-3 pr-4 font-mono-data text-white">{formatCurrency(c.websiteTotal || 0)}</td>
                  <td className="py-3 pr-4 font-mono-data text-emerald-400">{formatCurrency(c.websiteAdvance || 0)}</td>
                  <td className="py-3 pr-4 font-mono-data text-amber-400">{formatCurrency((c.websiteTotal || 0) - (c.websiteAdvance || 0))}</td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{c.websiteDueDate ? formatDate(c.websiteDueDate) : '—'}</td>
                  <td className="py-3 pr-4">
                    {c.websiteStatus && <StatusBadge status={c.websiteStatus} size="sm" />}
                  </td>
                  <td className="py-3 pr-4">
                    {c.maintenanceEnabled ? (
                      <div>
                        <div className="text-xs text-violet-300 font-mono-data">{formatCurrency(c.maintenanceAmount || 0)}/mo</div>
                        {c.maintenanceStatus && <StatusBadge status={c.maintenanceStatus} size="sm" />}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600">None</span>
                    )}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={onRecordPayment}
                      className="text-[11px] px-3 py-1 bg-violet-600/80 hover:bg-violet-500 text-white rounded-md transition-colors"
                    >
                      Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SocialMediaPipeline({ onRecordPayment }: { onRecordPayment: () => void }) {
  const socialClients = clients.filter(c => c.service === 'social_media' || c.service === 'both');

  const months = ['September 2026', 'October 2026', 'November 2026', 'December 2026'];

  return (
    <div className="space-y-6">
      {/* Recurring Schedule */}
      <div className="glass p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Monthly Billing Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs font-medium text-slate-500 pb-3 pr-4 uppercase tracking-wide">Client</th>
                <th className="text-left text-xs font-medium text-slate-500 pb-3 pr-4 uppercase tracking-wide">Package</th>
                <th className="text-left text-xs font-medium text-slate-500 pb-3 pr-4 uppercase tracking-wide">Amount/mo</th>
                {months.map(m => (
                  <th key={m} className="text-left text-xs font-medium text-slate-500 pb-3 pr-4 uppercase tracking-wide">{m.split(' ')[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {socialClients.map(c => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-white">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.business}</div>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{c.socialPackage}</td>
                  <td className="py-3 pr-4 font-mono-data text-cyan-300">{formatCurrency(c.socialAmount || 0)}</td>
                  {/* Sep - current month */}
                  <td className="py-3 pr-4">
                    <div className={`text-xs rounded-lg p-2 text-center ${c.socialStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : c.socialStatus === 'overdue' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      <div className="font-mono-data font-medium">{formatCurrency(c.socialAmount || 0)}</div>
                      <div className="text-[10px] mt-0.5 opacity-80">
                        {c.socialStatus === 'paid' ? 'Paid' : c.socialStatus === 'overdue' ? 'Overdue' : `Due ${formatCurrency(c.socialOutstanding || 0)}`}
                      </div>
                    </div>
                  </td>
                  {/* Oct, Nov, Dec - upcoming */}
                  {[1, 2, 3].map(offset => (
                    <td key={offset} className="py-3 pr-4">
                      <div className="text-xs rounded-lg p-2 text-center bg-white/[0.03] text-slate-500">
                        <div className="font-mono-data">{formatCurrency(c.socialAmount || 0)}</div>
                        <div className="text-[10px] mt-0.5">Upcoming</div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Social Media Client Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {socialClients.map(c => (
          <div key={c.id} className="glass p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-white">{c.name}</div>
                <div className="text-xs text-slate-500">{c.business}</div>
              </div>
              {c.socialStatus && <StatusBadge status={c.socialStatus} size="sm" />}
            </div>
            <div>
              <div className="text-2xl font-semibold font-mono-data text-cyan-300">{formatCurrency(c.socialAmount || 0)}</div>
              <div className="text-xs text-slate-500">per month · {c.socialPackage}</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs">Advance</span>
                <span className="font-mono-data text-emerald-400">{formatCurrency(c.socialAdvance || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs">Outstanding</span>
                <span className="font-mono-data text-amber-400">{formatCurrency(c.socialOutstanding || 0)}</span>
              </div>
              {c.socialNextDue && (
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">Next Due</span>
                  <span className="text-slate-300 text-xs">{formatDate(c.socialNextDue)}</span>
                </div>
              )}
            </div>
            <button
              onClick={onRecordPayment}
              className="w-full py-2 text-xs font-medium bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-600/30 rounded-lg transition-colors"
            >
              Record Payment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props {
  onRecordPayment: () => void;
}

export default function PaymentPipelinePage({ onRecordPayment }: Props) {
  const [tab, setTab] = useState<'website' | 'social'>('website');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Payment Pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage all service payment streams</p>
        </div>
      </div>

      {/* Service Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setTab('website')}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${tab === 'website' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' : 'glass text-slate-400 hover:text-white'}`}
        >
          🖥 Website
        </button>
        <button
          onClick={() => setTab('social')}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${tab === 'social' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25' : 'glass text-slate-400 hover:text-white'}`}
        >
          📱 Social Media
        </button>
      </div>

      {tab === 'website' ? (
        <WebsitePipeline onRecordPayment={onRecordPayment} />
      ) : (
        <SocialMediaPipeline onRecordPayment={onRecordPayment} />
      )}
    </div>
  );
}
