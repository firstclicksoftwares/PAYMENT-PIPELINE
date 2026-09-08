import React, { useState } from 'react';
import { usePaymentData } from '../context/PaymentContext';
import { formatCurrency, formatDate, getClientDisplayName } from '../data';
import StatusBadge from '../components/StatusBadge';
import type { PipelineStage, PaymentType, Client } from '../types';

const websiteStages: { key: PipelineStage; label: string; color: string; dot: string }[] = [
  { key: 'lead', label: 'Lead', color: 'border-slate-600 bg-slate-800/40', dot: 'bg-slate-500' },
  { key: 'advance_received', label: 'Advance Received', color: 'border-violet-600/50 bg-violet-900/20', dot: 'bg-violet-500' },
  { key: 'work_in_progress', label: 'Work in Progress', color: 'border-indigo-600/50 bg-indigo-900/20', dot: 'bg-indigo-500' },
  { key: 'payment_due', label: 'Payment Due', color: 'border-amber-600/50 bg-amber-900/20', dot: 'bg-amber-500' },
  { key: 'fully_paid', label: 'Fully Paid', color: 'border-emerald-600/50 bg-emerald-900/20', dot: 'bg-emerald-500' },
];

interface Props {
  activeTab?: 'website' | 'social' | 'maintenance';
  onTabChange?: (tab: 'website' | 'social' | 'maintenance') => void;
  onRecordPayment: (clientId?: string, paymentType?: PaymentType) => void;
  onEditClient?: (client: Client) => void;
}

function WebsitePipeline({ onRecordPayment, onEditClient }: Props) {
  const { clients, updateWebsiteStage, deleteClient } = usePaymentData();
  const websiteClients = clients.filter(c => c.service === 'website' || c.service === 'both');

  return (
    <div className="space-y-6">
      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {websiteStages.map(stage => {
          const stageClients = websiteClients.filter(c => (c.websiteStage || 'lead') === stage.key);
          return (
            <div key={stage.key} className={`border rounded-xl p-3 min-h-48 flex flex-col justify-between ${stage.color}`}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                  <span className="text-xs font-semibold text-slate-300">{stage.label}</span>
                  <span className="ml-auto text-xs text-slate-400 font-mono-data font-semibold bg-white/[0.08] px-1.5 py-0.5 rounded">{stageClients.length}</span>
                </div>
                <div className="space-y-2">
                  {stageClients.map(c => {
                    const remaining = Math.max(0, (c.websiteTotal || 0) - (c.websiteAdvance || 0));
                    return (
                      <div key={c.id} className="bg-[#0e0e1a]/90 border border-white/[0.08] rounded-xl p-3 space-y-2 shadow-lg">
                        <div className="text-sm font-medium text-white">{getClientDisplayName(c.name, c.business)}</div>
                        <div className="text-xs text-slate-400">{c.websiteProject || 'Website Redesign'}</div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.05]">
                          <span className="text-slate-500">Total: {formatCurrency(c.websiteTotal || 0)}</span>
                          <span className="font-mono-data font-semibold text-amber-400">{formatCurrency(remaining)} due</span>
                        </div>
                        {/* Dynamic Stage Change Selector */}
                        <div className="pt-1">
                          <select
                            value={c.websiteStage || 'lead'}
                            onChange={(e) => updateWebsiteStage(c.id, e.target.value as PipelineStage)}
                            className="w-full text-[11px] bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 rounded px-2 py-1 focus:outline-none cursor-pointer font-medium"
                          >
                            {websiteStages.map(s => (
                              <option key={s.key} value={s.key} className="bg-[#12121f] text-slate-200">
                                Move to: {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => onRecordPayment(c.id, 'website_onetime')}
                            className="flex-1 py-1 text-[11px] font-semibold bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/30 rounded-lg transition-colors text-center"
                          >
                            + Record Payment
                          </button>
                          <button
                            onClick={() => onEditClient && onEditClient(c)}
                            className="px-2 py-1 text-[11px] bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 border border-white/[0.1] rounded-lg transition-colors font-medium"
                            title="Edit Client / Project Details"
                          >
                            ✏ Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete client "${c.name}"?`)) {
                                deleteClient(c.id);
                              }
                            }}
                            className="px-2 py-1 text-[11px] bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg transition-colors font-medium"
                            title="Delete Client"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {stageClients.length === 0 && (
                    <div className="text-center py-8 text-slate-600 text-xs italic">No projects in this stage</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Website Client Detail Table */}
      <div className="glass p-5 rounded-xl border border-white/[0.06]">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">All Website Projects ({websiteClients.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Client', 'Project', 'Total', 'Advance', 'Remaining', 'Due Date', 'Pipeline Stage', 'Action'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 pb-3 pr-4 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {websiteClients.map(c => {
                const remaining = Math.max(0, (c.websiteTotal || 0) - (c.websiteAdvance || 0));
                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-white">{getClientDisplayName(c.name, c.business)}</div>
                      <div className="text-xs text-slate-500">{c.business}</div>
                    </td>
                    <td className="py-3 pr-4 text-slate-400 text-xs max-w-32 truncate">{c.websiteProject || '—'}</td>
                    <td className="py-3 pr-4 font-mono-data text-white">{formatCurrency(c.websiteTotal || 0)}</td>
                    <td className="py-3 pr-4 font-mono-data text-emerald-400">{formatCurrency(c.websiteAdvance || 0)}</td>
                    <td className="py-3 pr-4 font-mono-data text-amber-400">{formatCurrency(remaining)}</td>
                    <td className="py-3 pr-4 text-xs text-slate-400">{c.websiteDueDate ? formatDate(c.websiteDueDate) : '—'}</td>
                    <td className="py-3 pr-4">
                      <select
                        value={c.websiteStage || 'lead'}
                        onChange={(e) => updateWebsiteStage(c.id, e.target.value as PipelineStage)}
                        className="text-xs bg-white/[0.06] border border-white/[0.08] text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                      >
                        {websiteStages.map(s => (
                          <option key={s.key} value={s.key} className="bg-[#12121f] text-slate-200">
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRecordPayment(c.id, 'website_onetime')}
                          className="text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium"
                        >
                          Record Payment
                        </button>
                        <button
                          onClick={() => onEditClient && onEditClient(c)}
                          className="text-xs px-2.5 py-1.5 bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 border border-white/[0.1] rounded-lg transition-colors font-medium"
                          title="Edit Client / Project Details"
                        >
                          ✏ Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete client "${c.name}"?`)) {
                              deleteClient(c.id);
                            }
                          }}
                          className="text-xs px-2.5 py-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg transition-colors font-medium"
                          title="Delete Client"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {websiteClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-600">
                    No website clients recorded yet.
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

function SocialMediaPipeline({ onRecordPayment, onEditClient }: Props) {
  const { clients, payments, deleteClient } = usePaymentData();
  const socialClients = clients.filter(c => c.service === 'social_media' || c.service === 'both');

  const now = new Date();
  const currentMonthYear = now.toLocaleString('default', { month: 'short', year: 'numeric' });
  const months = [
    currentMonthYear,
    new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleString('default', { month: 'short', year: 'numeric' }),
    new Date(now.getFullYear(), now.getMonth() + 2, 1).toLocaleString('default', { month: 'short', year: 'numeric' }),
    new Date(now.getFullYear(), now.getMonth() + 3, 1).toLocaleString('default', { month: 'short', year: 'numeric' }),
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="glass p-5 rounded-xl border border-white/[0.06] flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-cyan-300">📱 Social Media Retainer (Monthly Recurring) Pipeline</h3>
          <p className="text-xs text-slate-400 mt-1">Every month retainer bills automatically track recurring due dates and payments.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono-data text-cyan-400">
            {formatCurrency(socialClients.reduce((acc, c) => acc + (c.socialAmount || 0), 0))}/mo
          </div>
          <div className="text-xs text-slate-500">Total Monthly Retainer Revenue</div>
        </div>
      </div>

      {/* Monthly Retainer Schedule */}
      <div className="glass p-5 rounded-xl border border-white/[0.06]">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Recurring Monthly Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs font-medium text-slate-500 pb-3 pr-4 uppercase tracking-wide">Client</th>
                <th className="text-left text-xs font-medium text-slate-500 pb-3 pr-4 uppercase tracking-wide">Package</th>
                <th className="text-left text-xs font-medium text-slate-500 pb-3 pr-4 uppercase tracking-wide">Monthly Fee</th>
                {months.map(m => (
                  <th key={m} className="text-left text-xs font-medium text-slate-500 pb-3 pr-4 uppercase tracking-wide">{m}</th>
                ))}
                <th className="text-right text-xs font-medium text-slate-500 pb-3 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {socialClients.map(c => {
                const clientPayments = payments.filter(p => p.clientId === c.id && p.paymentType === 'social_media');
                const hasPaidThisMonth = c.socialStatus === 'paid' || clientPayments.length > 0;

                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-medium text-white">{getClientDisplayName(c.name, c.business)}</div>
                      <div className="text-xs text-slate-500">{c.business}</div>
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-slate-400">{c.socialPackage || 'Standard Package'}</td>
                    <td className="py-3.5 pr-4 font-mono-data text-cyan-300 font-semibold">{formatCurrency(c.socialAmount || 0)}</td>
                    {/* Current Month Column */}
                    <td className="py-3.5 pr-4">
                      <div className={`text-xs rounded-xl p-2 text-center border ${hasPaidThisMonth ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : c.socialStatus === 'overdue' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                        <div className="font-mono-data font-bold">{formatCurrency(c.socialAmount || 0)}</div>
                        <div className="text-[10px] mt-0.5 font-medium uppercase tracking-wide">
                          {hasPaidThisMonth ? '✓ Paid' : c.socialStatus === 'overdue' ? '! Overdue' : 'Due'}
                        </div>
                      </div>
                    </td>
                    {/* Future Months */}
                    {[1, 2, 3].map(offset => (
                      <td key={offset} className="py-3.5 pr-4">
                        <div className="text-xs rounded-xl p-2 text-center bg-white/[0.03] border border-white/[0.05] text-slate-500">
                          <div className="font-mono-data">{formatCurrency(c.socialAmount || 0)}</div>
                          <div className="text-[10px] mt-0.5 uppercase tracking-wide">Upcoming</div>
                        </div>
                      </td>
                    ))}
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onRecordPayment(c.id, 'social_media')}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all shadow-md shadow-cyan-600/20"
                        >
                          Record Retainer
                        </button>
                        <button
                          onClick={() => onEditClient && onEditClient(c)}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 border border-white/[0.1] rounded-lg transition-all font-medium"
                          title="Edit Client Details"
                        >
                          ✏ Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete client "${c.name}"?`)) {
                              deleteClient(c.id);
                            }
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg transition-all"
                          title="Delete Client"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {socialClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-600">
                    No social media retainer clients added yet. Click "+ Add Client" to create a Social Media client.
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

function MaintenancePipeline({ onRecordPayment, onEditClient }: Props) {
  const { clients, deleteClient } = usePaymentData();
  const maintClients = clients.filter(c => c.maintenanceEnabled && (c.maintenanceAmount || 0) > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass p-5 rounded-xl border border-white/[0.06] flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-violet-300">🛠 Website Maintenance (Monthly Recurring) Pipeline</h3>
          <p className="text-xs text-slate-400 mt-1">Tracks recurring monthly website maintenance, security updates, and hosting support.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono-data text-violet-400">
            {formatCurrency(maintClients.reduce((acc, c) => acc + (c.maintenanceAmount || 0), 0))}/mo
          </div>
          <div className="text-xs text-slate-500">Total Monthly Maintenance Revenue</div>
        </div>
      </div>

      {/* Maintenance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {maintClients.map(c => (
          <div key={c.id} className="glass p-5 space-y-4 rounded-xl border border-white/[0.06] relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-white">{getClientDisplayName(c.name, c.business)}</div>
                <div className="text-xs text-slate-500">{c.business}</div>
              </div>
              <StatusBadge status={c.maintenanceStatus || 'upcoming'} size="sm" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono-data text-violet-300">{formatCurrency(c.maintenanceAmount || 0)}</div>
              <div className="text-xs text-slate-500">per month · {c.websiteProject || 'Website Maintenance'}</div>
            </div>
            <div className="space-y-1.5 text-xs border-t border-white/[0.06] pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Start Date</span>
                <span className="text-slate-300">{formatDate(c.maintenanceStartDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Next Monthly Due</span>
                <span className="text-amber-400 font-medium">{formatDate(c.maintenanceNextDue)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onRecordPayment(c.id, 'website_maintenance')}
                className="flex-1 py-2.5 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors shadow-lg shadow-violet-600/20"
              >
                Record Maintenance Payment
              </button>
              <button
                onClick={() => onEditClient && onEditClient(c)}
                className="px-3 py-2.5 text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 border border-white/[0.1] rounded-lg transition-colors"
                title="Edit Client Details"
              >
                ✏ Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete client "${c.name}"?`)) {
                    deleteClient(c.id);
                  }
                }}
                className="px-3 py-2.5 text-xs font-semibold bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg transition-colors"
                title="Delete Client"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
        {maintClients.length === 0 && (
          <div className="col-span-full py-16 text-center glass rounded-xl text-slate-600 text-sm">
            No clients currently have monthly maintenance enabled. Enable maintenance when adding a website client.
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPipelinePage({ activeTab, onTabChange, onRecordPayment, onEditClient }: Props) {
  const [internalTab, setInternalTab] = useState<'website' | 'social' | 'maintenance'>('website');

  const tab = activeTab ?? internalTab;

  const handleTabChange = (newTab: 'website' | 'social' | 'maintenance') => {
    if (onTabChange) {
      onTabChange(newTab);
    } else {
      setInternalTab(newTab);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Payment Pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">Separate dynamic pipelines for Website Projects, Social Media Retainers & Monthly Maintenance</p>
        </div>
      </div>

      {/* Service Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => handleTabChange('website')}
          className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all ${tab === 'website' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' : 'glass text-slate-400 hover:text-white border border-white/[0.06]'}`}
        >
          🖥 Website Projects
        </button>
        <button
          onClick={() => handleTabChange('social')}
          className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all ${tab === 'social' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25' : 'glass text-slate-400 hover:text-white border border-white/[0.06]'}`}
        >
          📱 Social Media Retainers
        </button>
        <button
          onClick={() => handleTabChange('maintenance')}
          className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all ${tab === 'maintenance' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'glass text-slate-400 hover:text-white border border-white/[0.06]'}`}
        >
          🛠 Monthly Maintenance
        </button>
      </div>

      {tab === 'website' ? (
        <WebsitePipeline onRecordPayment={onRecordPayment} onEditClient={onEditClient} />
      ) : tab === 'social' ? (
        <SocialMediaPipeline onRecordPayment={onRecordPayment} onEditClient={onEditClient} />
      ) : (
        <MaintenancePipeline onRecordPayment={onRecordPayment} onEditClient={onEditClient} />
      )}
    </div>
  );
}
