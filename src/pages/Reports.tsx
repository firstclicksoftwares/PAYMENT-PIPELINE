import React from 'react';
import { usePaymentData } from '../context/PaymentContext';
import { formatCurrency, getClientDisplayName } from '../data';

export default function Reports() {
  const { clients, payments } = usePaymentData();

  const totalRevenue = payments.reduce((s, p) => s + (p.received || 0), 0);
  const websiteRevenue = payments.filter(p => p.paymentType === 'website_onetime').reduce((s, p) => s + (p.received || 0), 0);
  const maintenanceRevenue = payments.filter(p => p.paymentType === 'website_maintenance').reduce((s, p) => s + (p.received || 0), 0);
  const socialRevenue = payments.filter(p => p.paymentType === 'social_media').reduce((s, p) => s + (p.received || 0), 0);
  const totalOutstanding = clients.reduce((s, c) => s + (c.totalDue || 0), 0);
  const recurringMonthly = clients.reduce((s, c) => s + (c.socialAmount || 0) + (c.maintenanceEnabled ? (c.maintenanceAmount || 0) : 0), 0);

  const revenueCards = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: '₹' },
    { label: 'Website Revenue', value: formatCurrency(websiteRevenue), color: 'text-violet-400', bg: 'bg-violet-500/10', icon: '🖥' },
    { label: 'Social Media Revenue', value: formatCurrency(socialRevenue), color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: '📱' },
    { label: 'Maintenance Revenue', value: formatCurrency(maintenanceRevenue), color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: '🔧' },
    { label: 'Outstanding Amount', value: formatCurrency(totalOutstanding), color: 'text-amber-400', bg: 'bg-amber-500/10', icon: '⏳' },
    { label: 'Monthly Recurring', value: formatCurrency(recurringMonthly), color: 'text-pink-400', bg: 'bg-pink-500/10', icon: '🔄' },
  ];

  // Dynamic past 6 months data calculation from actual payments
  const now = new Date();
  const monthsList = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthsList.push({
      shortName: d.toLocaleString('default', { month: 'short' }),
      yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    });
  }

  const monthlyData = monthsList.map(m => {
    const sum = payments.reduce((acc, p) => {
      if (p.date && p.date.startsWith(m.yearMonth)) {
        return acc + (p.received || 0);
      }
      return acc;
    }, 0);
    return { month: m.shortName, amount: sum };
  });

  const maxMonthly = Math.max(1, ...monthlyData.map(d => d.amount));

  const byRevenue = [...clients].sort((a, b) => (b.totalPaid || 0) - (a.totalPaid || 0)).slice(0, 5);
  const pendingClients = clients.filter(c => (c.totalDue || 0) > 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Realtime Financial Overview for FIRST CLICK</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {revenueCards.map(card => (
          <div key={card.label} className="glass p-4 flex flex-col gap-3 rounded-xl border border-white/[0.06]">
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center text-base`}>
              {card.icon}
            </div>
            <div>
              <div className={`text-xl font-semibold font-mono-data ${card.color}`}>{card.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Collections Bar Chart */}
        <div className="glass p-5 rounded-xl border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">Monthly Collections</h3>
          <div className="flex items-end gap-3 h-36">
            {monthlyData.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="text-[10px] font-mono-data text-slate-500">{formatCurrency(d.amount).replace('₹', '')}</div>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-violet-700 to-violet-500 transition-all"
                  style={{ height: `${d.amount > 0 ? (d.amount / maxMonthly) * 100 : 4}%`, minHeight: '4px' }}
                />
                <div className="text-[10px] text-slate-500">{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Website vs Social Media Breakdown */}
        <div className="glass p-5 rounded-xl border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">Revenue Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Website One-Time', value: websiteRevenue, color: 'bg-violet-500', total: totalRevenue },
              { label: 'Social Media Monthly', value: socialRevenue, color: 'bg-cyan-500', total: totalRevenue },
              { label: 'Website Maintenance', value: maintenanceRevenue, color: 'bg-indigo-500', total: totalRevenue },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-mono-data text-slate-300">{formatCurrency(item.value)}</span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-600 mt-1">{item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%</div>
              </div>
            ))}
          </div>

          {/* Outstanding vs Collected */}
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <div className="text-xs text-slate-500 mb-2">Collected vs Outstanding</div>
            <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 rounded-l-full"
                style={{ width: `${totalRevenue + totalOutstanding > 0 ? (totalRevenue / (totalRevenue + totalOutstanding)) * 100 : 50}%` }}
              />
              <div
                className="h-full bg-amber-500/70"
                style={{ width: `${totalRevenue + totalOutstanding > 0 ? (totalOutstanding / (totalRevenue + totalOutstanding)) * 100 : 50}%` }}
              />
            </div>
            <div className="flex gap-4 mt-2 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" />Collected {formatCurrency(totalRevenue)}</span>
              <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500/70" />Outstanding {formatCurrency(totalOutstanding)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Clients */}
        <div className="glass p-5 rounded-xl border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Top Clients by Revenue</h3>
          {byRevenue.length === 0 ? (
            <div className="text-center py-6 text-slate-600 text-sm">No clients recorded yet</div>
          ) : (
            <div className="space-y-3">
              {byRevenue.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 text-xs flex items-center justify-center font-semibold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{getClientDisplayName(c.name, c.business)}</div>
                    <div className="text-xs text-slate-500 truncate">{c.business}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono-data text-emerald-400 text-sm">{formatCurrency(c.totalPaid)}</div>
                    <div className="text-xs text-slate-600">{formatCurrency(c.totalContractValue)} contract</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending & Outstanding Clients */}
        <div className="glass p-5 rounded-xl border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">Clients with Pending / Outstanding Dues ({pendingClients.length})</h3>
          {pendingClients.length === 0 ? (
            <div className="text-center py-8 text-emerald-500 text-sm">All payments are on track ✓</div>
          ) : (
            <div className="space-y-3">
              {pendingClients.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-amber-500/[0.07] border border-amber-500/20 rounded-lg">
                  <div>
                    <div className="text-sm text-white font-medium">{getClientDisplayName(c.name, c.business)}</div>
                    <div className="text-xs text-slate-500">{c.business}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-data text-amber-400 font-medium">{formatCurrency(c.totalDue)}</div>
                    <div className="text-[10px] text-slate-500">Paid: {formatCurrency(c.totalPaid)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
