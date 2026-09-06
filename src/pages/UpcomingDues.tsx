import { payments, formatCurrency, formatDate, daysUntil } from '../data';
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
    filter: (days: number) => days > 7 && days <= 30,
  },
];

const pendingPayments = payments.filter(p => p.status !== 'paid');

interface Props {
  onRecordPayment: () => void;
}

export default function UpcomingDues({ onRecordPayment }: Props) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Upcoming Dues</h1>
        <p className="text-sm text-slate-500 mt-0.5">All pending and upcoming payments</p>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-4 gap-4">
        {groups.map(g => {
          const count = pendingPayments.filter(p => g.filter(daysUntil(p.dueDate))).length;
          const total = pendingPayments.filter(p => g.filter(daysUntil(p.dueDate))).reduce((s, p) => s + p.remaining, 0);
          return (
            <div key={g.key} className={`glass p-4 border ${g.headerBg}`}>
              <div className={`text-lg font-semibold font-mono-data ${g.color}`}>{count}</div>
              <div className="text-xs text-slate-400 mt-0.5">{g.label}</div>
              <div className={`text-sm font-mono-data mt-2 ${g.color}`}>{formatCurrency(total)}</div>
            </div>
          );
        })}
      </div>

      {/* Grouped Lists */}
      {groups.map(g => {
        const items = pendingPayments.filter(p => g.filter(daysUntil(p.dueDate)));
        if (items.length === 0) return null;
        return (
          <div key={g.key} className="glass overflow-hidden">
            <div className={`px-5 py-3 border-b border-white/[0.06] flex items-center gap-2 ${g.headerBg} border-b`}>
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
                        <div className="font-medium text-white">{p.clientName}</div>
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
                          <button className="text-[11px] px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-400 rounded-md transition-colors">
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
        );
      })}
    </div>
  );
}
