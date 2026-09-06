import React, { useState } from 'react';
import { usePaymentData } from '../context/PaymentContext';
import { formatCurrency, formatDate, getClientDisplayName } from '../data';
import type { Client, TimelineEvent } from '../types';
import StatusBadge from '../components/StatusBadge';

function serviceTag(service: string) {
  if (service === 'website') return <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-medium">Website</span>;
  if (service === 'social_media') return <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-medium">Social Media</span>;
  return (
    <span className="flex gap-1">
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-medium">Website</span>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-medium">Social</span>
    </span>
  );
}

function buildTimeline(client: Client): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { id: 't0', date: client.createdAt, description: 'Client Created', status: 'done' },
  ];
  if (client.websiteAdvance && client.websiteAdvance > 0) {
    events.push({ id: 't1', date: client.createdAt, description: 'Website Advance Received', amount: client.websiteAdvance, status: 'done' });
  }
  if (client.websiteStage === 'work_in_progress') {
    events.push({ id: 't2', date: client.createdAt, description: 'Website Development Started', status: 'done' });
  }
  if (client.websiteDeliveryDate) {
    const delivered = new Date(client.websiteDeliveryDate) <= new Date();
    events.push({ id: 't3', date: client.websiteDeliveryDate, description: 'Website Delivered', status: delivered ? 'done' : 'upcoming' });
  }
  if (client.websiteTotal && client.websiteAdvance) {
    const remaining = client.websiteTotal - client.websiteAdvance;
    if (remaining > 0) {
      events.push({ id: 't4', date: client.websiteDueDate || '', description: 'Website Balance Due', amount: remaining, status: client.websiteStatus === 'overdue' ? 'warning' : 'upcoming' });
    }
  }
  if (client.maintenanceEnabled) {
    events.push({ id: 't5', date: client.maintenanceStartDate || '', description: 'Monthly Maintenance Active', amount: client.maintenanceAmount, status: client.maintenanceStatus === 'due' ? 'warning' : 'upcoming' });
  }
  if (client.socialAmount) {
    events.push({ id: 't6', date: client.socialNextDue || '', description: 'Social Media Payment Due', amount: client.socialAmount, status: client.socialStatus === 'overdue' ? 'warning' : client.socialStatus === 'paid' ? 'done' : 'upcoming' });
  }
  return events;
}

function ClientProfile({
  client,
  onClose,
  onRecordPayment,
  onEdit,
  onDelete,
}: {
  client: Client;
  onClose: () => void;
  onRecordPayment: () => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}) {
  const { payments } = usePaymentData();
  const timeline = buildTimeline(client);
  const clientPayments = payments.filter(p => p.clientId === client.id);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-[#0e0e1a] border-l border-white/[0.06] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-start justify-between sticky top-0 bg-[#0e0e1a] z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{client.name}</h2>
                <p className="text-sm text-slate-400">{client.business}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-4 space-y-3 rounded-xl border border-white/[0.06]">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Information</h3>
              <div className="space-y-2">
                {[
                  { label: 'Phone', value: client.phone },
                  { label: 'Email', value: client.email },
                  { label: 'Service', value: client.service.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
                  { label: 'Since', value: formatDate(client.createdAt) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="text-slate-200">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass p-4 space-y-3 rounded-xl border border-white/[0.06]">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Summary</h3>
              <div className="space-y-2">
                {[
                  { label: 'Contract', value: formatCurrency(client.totalContractValue), color: 'text-slate-200' },
                  { label: 'Paid', value: formatCurrency(client.totalPaid), color: 'text-emerald-400' },
                  { label: 'Due', value: formatCurrency(client.totalDue), color: 'text-amber-400' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{row.label}</span>
                    <span className={`font-mono-data font-medium ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Details */}
          {(client.service === 'website' || client.service === 'both') && (
            <div className="glass p-4 space-y-3 rounded-xl border border-white/[0.06]">
              <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Website — {client.websiteProject || 'Project'}</h3>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-slate-500 text-xs">Total</div>
                  <div className="text-white font-mono-data font-medium">{formatCurrency(client.websiteTotal || 0)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Advance</div>
                  <div className="text-emerald-400 font-mono-data font-medium">{formatCurrency(client.websiteAdvance || 0)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Remaining</div>
                  <div className="text-amber-400 font-mono-data font-medium">{formatCurrency((client.websiteTotal || 0) - (client.websiteAdvance || 0))}</div>
                </div>
              </div>
              {client.websiteStatus && (
                <div className="flex items-center gap-2 pt-1">
                  <StatusBadge status={client.websiteStatus} size="sm" />
                  {client.websiteDueDate && <span className="text-xs text-slate-500">Due {formatDate(client.websiteDueDate)}</span>}
                </div>
              )}
              {client.maintenanceEnabled && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <div className="text-xs text-slate-500 mb-1">Monthly Maintenance</div>
                  <div className="flex items-center gap-3">
                    <span className="text-violet-300 font-mono-data font-medium">{formatCurrency(client.maintenanceAmount || 0)}/mo</span>
                    {client.maintenanceStatus && <StatusBadge status={client.maintenanceStatus} size="sm" />}
                    {client.maintenanceNextDue && <span className="text-xs text-slate-500">Next: {formatDate(client.maintenanceNextDue)}</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {(client.service === 'social_media' || client.service === 'both') && (
            <div className="glass p-4 space-y-3 rounded-xl border border-white/[0.06]">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Social Media — {client.socialPackage || 'Package'}</h3>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-slate-500 text-xs">Monthly</div>
                  <div className="text-white font-mono-data font-medium">{formatCurrency(client.socialAmount || 0)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Advance</div>
                  <div className="text-emerald-400 font-mono-data font-medium">{formatCurrency(client.socialAdvance || 0)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Outstanding</div>
                  <div className="text-amber-400 font-mono-data font-medium">{formatCurrency(client.socialOutstanding || 0)}</div>
                </div>
              </div>
              {client.socialStatus && (
                <div className="flex items-center gap-2 pt-1">
                  <StatusBadge status={client.socialStatus} size="sm" />
                  {client.socialNextDue && <span className="text-xs text-slate-500">Next due {formatDate(client.socialNextDue)}</span>}
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Payment Timeline</h3>
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-white/[0.06]" />
              {timeline.map((event) => (
                <div key={event.id} className="relative mb-4 last:mb-0">
                  <div className={`absolute -left-4 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-bold
                    ${event.status === 'done' ? 'bg-emerald-500 border-emerald-400 text-white' :
                      event.status === 'warning' ? 'bg-amber-500 border-amber-400 text-white' :
                      'bg-[#1a1a28] border-white/20 text-slate-400'}`}>
                    {event.status === 'done' ? '✓' : event.status === 'warning' ? '!' : '○'}
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2 ml-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-slate-200">{event.description}</div>
                        {event.date && <div className="text-xs text-slate-500 mt-0.5">{formatDate(event.date)}</div>}
                      </div>
                      {event.amount && (
                        <div className={`text-sm font-mono-data font-medium ${event.status === 'done' ? 'text-emerald-400' : event.status === 'warning' ? 'text-amber-400' : 'text-slate-400'}`}>
                          {formatCurrency(event.amount)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment History</h3>
            {clientPayments.length === 0 ? (
              <div className="text-center py-6 text-slate-600 text-sm glass rounded-xl">No payments recorded yet</div>
            ) : (
              <div className="space-y-2">
                {clientPayments.map(p => (
                  <div key={p.id} className="glass p-3 flex items-center justify-between text-sm rounded-lg border border-white/[0.05]">
                    <div>
                      <div className="text-slate-200 font-medium">
                        {p.paymentType === 'website_onetime' ? 'Website Payment' : p.paymentType === 'website_maintenance' ? 'Maintenance' : 'Social Media'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{formatDate(p.date)} · {p.method?.replace('_', ' ').toUpperCase()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono-data font-medium text-emerald-400">{formatCurrency(p.received)}</div>
                      {p.remaining > 0 && <div className="text-xs text-amber-400/80">{formatCurrency(p.remaining)} remaining</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onRecordPayment} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
              + Add Payment
            </button>
            <button onClick={() => { onEdit(client); onClose(); }} className="px-4 py-2.5 bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 text-sm font-medium rounded-lg transition-colors border border-white/[0.08]">
              ✏ Edit Client
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete client "${client.name}"?`)) {
                  onDelete(client.id);
                  onClose();
                }
              }}
              className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 text-sm font-medium rounded-lg transition-colors border border-red-500/20"
            >
              Delete Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  onAddClient: () => void;
  onRecordPayment: () => void;
  onEditClient?: (client: Client) => void;
}

export default function ClientsPage({ onAddClient, onRecordPayment, onEditClient }: Props) {
  const { clients, deleteClient } = usePaymentData();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Client | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = clients.filter(c => {
    const matchSearch = search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.business.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.overallStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Clients</h1>
          <p className="text-sm text-slate-500 mt-0.5">{clients.length} clients registered in Realtime DB</p>
        </div>
        <button
          onClick={onAddClient}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-violet-600/20"
        >
          + Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients by name, business, phone..."
            className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'paid', 'partially_paid', 'due', 'overdue'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === s ? 'bg-violet-600 text-white' : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'}`}
            >
              {s === 'all' ? 'All' : s === 'partially_paid' ? 'Partial' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Client Table */}
      <div className="glass overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Client', 'Service', 'Contract', 'Paid', 'Due', 'Next Due', 'Status', ''].map(h => (
                <th key={h} className="text-left text-xs font-medium text-slate-500 px-5 py-3 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-white/[0.03] transition-colors cursor-pointer" onClick={() => setSelected(c)}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-white">{getClientDisplayName(c.name, c.business)}</div>
                      <div className="text-xs text-slate-500">{c.business}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">{serviceTag(c.service)}</td>
                <td className="px-5 py-4 font-mono-data text-slate-200">{formatCurrency(c.totalContractValue)}</td>
                <td className="px-5 py-4 font-mono-data text-emerald-400">{formatCurrency(c.totalPaid)}</td>
                <td className="px-5 py-4 font-mono-data text-amber-400">{formatCurrency(c.totalDue)}</td>
                <td className="px-5 py-4 text-slate-400 text-xs">
                  {c.websiteDueDate ? formatDate(c.websiteDueDate) : c.socialNextDue ? formatDate(c.socialNextDue) : '—'}
                </td>
                <td className="px-5 py-4"><StatusBadge status={c.overallStatus} size="sm" /></td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); setSelected(c); }}
                      className="text-xs px-3 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-md transition-colors"
                    >
                      View →
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onEditClient && onEditClient(c); }}
                      className="text-xs px-2.5 py-1 bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 border border-white/[0.1] rounded-md transition-colors font-medium"
                      title="Edit Client Details"
                    >
                      ✏ Edit
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete client "${c.name}"?`)) {
                          deleteClient(c.id);
                        }
                      }}
                      className="text-xs px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-md transition-colors"
                      title="Delete Client"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-600">
                  {clients.length === 0 ? 'No clients found in Supabase DB. Click "+ Add Client" to create your first client.' : 'No clients match your filter criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <ClientProfile
          client={selected}
          onClose={() => setSelected(null)}
          onRecordPayment={onRecordPayment}
          onEdit={(c) => onEditClient && onEditClient(c)}
          onDelete={deleteClient}
        />
      )}
    </div>
  );
}
