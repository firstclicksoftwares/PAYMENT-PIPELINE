import React, { useState, useCallback } from 'react';
import { PaymentProvider, usePaymentData } from './context/PaymentContext';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/Clients';
import PaymentPipelinePage from './pages/PaymentPipeline';
import UpcomingDues from './pages/UpcomingDues';
import PaymentHistory from './pages/PaymentHistory';
import Reports from './pages/Reports';
import RecordPaymentModal from './components/RecordPaymentModal';
import AddClientModal from './components/AddClientModal';
import AddDueModal from './components/AddDueModal';
import EditPaymentModal from './components/EditPaymentModal';
import EditClientModal from './components/EditClientModal';
import ToastContainer from './components/Toast';
import { daysUntil } from './data';
import type { Toast, PaymentType, Payment, Client } from './types';

type Page = 'dashboard' | 'clients' | 'pipeline' | 'upcoming' | 'history' | 'reports' | 'settings';

const navItems: { key: Page; label: string; icon: string; sub?: { key: string; label: string }[] }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '▦' },
  { key: 'clients', label: 'Clients', icon: '👥' },
  {
    key: 'pipeline',
    label: 'Payment Pipeline',
    icon: '⟶',
    sub: [
      { key: 'website', label: 'Website' },
      { key: 'social', label: 'Social Media' },
      { key: 'maintenance', label: 'Maintenance' },
    ],
  },
  { key: 'upcoming', label: 'Upcoming Dues', icon: '⏰' },
  { key: 'history', label: 'Payment History', icon: '📋' },
  { key: 'reports', label: 'Reports', icon: '📊' },
  { key: 'settings', label: 'Settings', icon: '⚙' },
];

const SQL_SCHEMA_SCRIPT = `-- FIRST CLICK PAYMENT PIPELINE - SUPABASE REALTIME SCHEMA
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('website', 'social_media', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Website fields
  website_project TEXT,
  website_total NUMERIC DEFAULT 0,
  website_advance NUMERIC DEFAULT 0,
  website_delivery_date DATE,
  website_due_date DATE,
  website_status TEXT DEFAULT 'upcoming',
  website_stage TEXT DEFAULT 'lead',

  -- Maintenance fields
  maintenance_enabled BOOLEAN DEFAULT FALSE,
  maintenance_amount NUMERIC DEFAULT 0,
  maintenance_start_date DATE,
  maintenance_next_due DATE,
  maintenance_status TEXT DEFAULT 'upcoming',

  -- Social Media fields
  social_package TEXT,
  social_amount NUMERIC DEFAULT 0,
  social_start_date DATE,
  social_next_due DATE,
  social_advance NUMERIC DEFAULT 0,
  social_outstanding NUMERIC DEFAULT 0,
  social_status TEXT DEFAULT 'upcoming',

  -- Totals
  total_contract_value NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  total_due NUMERIC DEFAULT 0,
  overall_status TEXT DEFAULT 'due'
);

CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  business TEXT NOT NULL,
  service TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  total_amount NUMERIC DEFAULT 0,
  received NUMERIC DEFAULT 0,
  remaining NUMERIC DEFAULT 0,
  date DATE NOT NULL,
  due_date DATE,
  method TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'clients'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  END IF;
END $$;
`;

function AppContent() {
  const [page, setPage] = useState<Page>('dashboard');
  const [pipelineTab, setPipelineTab] = useState<'website' | 'social' | 'maintenance'>('website');
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [recordModalParams, setRecordModalParams] = useState<{ clientId?: string; paymentType?: PaymentType } | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddDue, setShowAddDue] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pipelineExpanded, setPipelineExpanded] = useState(false);

  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { payments, isConnected, isLocalStorage, dbError, refreshData, resetToDemoData, resetPaymentsKeepClients, resetAllData } = usePaymentData();

  const handleOpenRecordPayment = (clientId?: string, paymentType?: PaymentType) => {
    setRecordModalParams({ clientId, paymentType });
    setShowRecordPayment(true);
  };

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    addToast('SQL Schema copied to clipboard! Paste into Supabase SQL editor.', 'success');
  };

  // Compute live notifications from real database records
  const dynamicNotifications = payments
    .filter(p => p.status !== 'paid' && p.remaining > 0)
    .map(p => {
      const days = daysUntil(p.dueDate);
      const isOverdue = days < 0;
      return {
        id: p.id,
        message: `${p.clientName} - ${p.business} (${isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `Due in ${days}d`})`,
        type: isOverdue ? 'overdue' : 'due',
        amount: p.remaining,
      };
    });

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard onRecordPayment={handleOpenRecordPayment} onEditPayment={setEditingPayment} onAddDue={() => setShowAddDue(true)} />;
      case 'clients':
        return <ClientsPage onAddClient={() => setShowAddClient(true)} onRecordPayment={handleOpenRecordPayment} onEditClient={setEditingClient} />;
      case 'pipeline':
        return (
          <PaymentPipelinePage
            activeTab={pipelineTab}
            onTabChange={setPipelineTab}
            onRecordPayment={handleOpenRecordPayment}
            onEditClient={setEditingClient}
          />
        );
      case 'upcoming':
        return <UpcomingDues onRecordPayment={handleOpenRecordPayment} onEditPayment={setEditingPayment} onAddDue={() => setShowAddDue(true)} />;
      case 'history':
        return <PaymentHistory onEditPayment={setEditingPayment} />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return (
          <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-white mb-2">Settings</h1>

            <div className="glass p-6 rounded-xl border border-white/[0.06] space-y-5 max-w-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div>
                  <div className="text-sm font-semibold text-white">Database & Persistence Mode</div>
                  <div className="text-xs text-slate-500">myqegsydtpbkiarqobkp.supabase.co</div>
                </div>
                {isLocalStorage ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Local Persistent Storage
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Supabase Realtime Active
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-400 space-y-3">
                <p>
                  {isLocalStorage
                    ? 'Operating in local persistent mode. All client additions, payments, and stage updates are saved locally and fully responsive.'
                    : 'All client records, website payment stages, and monthly social media subscriptions sync directly via PostgreSQL WebSocket replication.'}
                </p>

                <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-lg space-y-3">
                  <div className="text-xs font-semibold text-slate-300">To Enable Multi-Device Supabase Cloud Sync:</div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-xs">
                    <li>Copy the SQL schema script below.</li>
                    <li>Open your Supabase project SQL Editor (<code className="text-violet-300">https://supabase.com/dashboard</code>).</li>
                    <li>Paste and run the query to create the <code className="text-violet-300">clients</code> and <code className="text-violet-300">payments</code> tables.</li>
                    <li>Click "Retry Supabase Sync" below.</li>
                  </ol>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleCopySchema}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      📋 Copy SQL Schema
                    </button>
                    <button
                      onClick={() => {
                        refreshData();
                        addToast('Re-checking Supabase connection...', 'info');
                      }}
                      className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border border-white/[0.08]"
                    >
                      🔄 Retry Supabase Sync
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] space-y-3">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Database Reset Actions</div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                    <div>
                      <div className="text-xs font-medium text-slate-200">Reset Payments (Keep Added Clients)</div>
                      <div className="text-[11px] text-slate-500">Keep added client accounts, reset payment history & clear collected totals</div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Reset payment history while keeping added clients?')) {
                          resetPaymentsKeepClients();
                          addToast('Payments reset cleanly! Added clients preserved.', 'success');
                        }
                      }}
                      className="px-3 py-1.5 bg-violet-600/80 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors shadow"
                    >
                      Reset Payments (Keep Clients)
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                    <div>
                      <div className="text-xs font-medium text-slate-200">Clear All Data (Clean Slate)</div>
                      <div className="text-[11px] text-slate-500">Wipe all client records & payment logs completely (0 items)</div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete ALL clients and ALL payments?')) {
                          resetAllData();
                          addToast('All database records cleared to clean slate', 'info');
                        }
                      }}
                      className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-500/30"
                    >
                      Wipe All Data
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                    <div>
                      <div className="text-xs font-medium text-slate-200">Restore Demo Data</div>
                      <div className="text-[11px] text-slate-500">Restore standard sample agency records for demonstration</div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Restore standard demo data?')) {
                          resetToDemoData();
                          addToast('Reset to default agency demo data', 'info');
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-medium rounded-lg transition-colors border border-amber-500/30"
                    >
                      Restore Demo Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#09090f] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col bg-[#0c0c18] border-r border-white/[0.06]">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-600/20">
              <span className="text-white text-xs font-bold">FC</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">FIRST CLICK</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Payment Hub</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = page === item.key;
            return (
              <div key={item.key}>
                <button
                  onClick={() => {
                    setPage(item.key);
                    if (item.sub) setPipelineExpanded(p => !p);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                    ${isActive ? 'nav-active text-violet-300 bg-violet-600/10' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'}`}
                >
                  <span className="text-base w-5 text-center shrink-0 leading-none">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                  {item.sub && (
                    <span className={`ml-auto text-[10px] transition-transform ${(isActive || pipelineExpanded) ? 'rotate-90' : ''}`}>▶</span>
                  )}
                </button>
                {item.sub && (isActive || pipelineExpanded) && (
                  <div className="ml-8 mt-0.5 space-y-0.5">
                    {item.sub.map(s => {
                      const isSubActive = isActive && pipelineTab === s.key;
                      return (
                        <div
                          key={s.key}
                          onClick={() => {
                            setPage('pipeline');
                            setPipelineTab(s.key as 'website' | 'social' | 'maintenance');
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer rounded-md transition-colors ${
                            isSubActive
                              ? 'text-violet-300 font-semibold bg-violet-600/15'
                              : 'text-slate-500 hover:text-violet-300 hover:bg-white/[0.03]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-violet-400' : 'bg-current opacity-50'}`} />
                          {s.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t border-white/[0.06] pt-4 space-y-2">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(n => !n)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] transition-all relative"
          >
            <span className="text-base">🔔</span>
            <span>Notifications</span>
            {dynamicNotifications.length > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {dynamicNotifications.length}
              </span>
            )}
          </button>

          {/* Admin */}
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              FC
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-300 truncate">First Click Admin</div>
              <div className="text-[10px] text-slate-500 truncate">{isLocalStorage ? 'Local Storage' : 'Live Realtime'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-[#09090f]/95 border-b border-white/[0.05] flex items-center justify-between px-6 shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-300 capitalize">
              {navItems.find(n => n.key === page)?.label || ''}
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddClient(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] text-slate-200 text-xs font-medium rounded-lg transition-colors border border-white/[0.07]"
            >
              + Add Client
            </button>
            <button
              onClick={() => setShowAddDue(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-medium rounded-lg transition-colors border border-amber-500/30"
            >
              📌 + Add Due / Bill
            </button>
            <button
              onClick={() => handleOpenRecordPayment()}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors shadow-lg shadow-violet-600/20"
            >
              + Record Payment
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>


      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}>
          <div
            className="absolute bottom-20 left-56 ml-2 w-80 glass rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/[0.08]"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Notifications ({dynamicNotifications.length})</span>
              <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white text-sm">✕</button>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {dynamicNotifications.map(n => (
                <div key={n.id} className="px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03]">
                  <div className="flex items-start gap-2">
                    <span className={`text-sm ${n.type === 'overdue' ? 'text-red-400' : 'text-amber-400'}`}>
                      {n.type === 'overdue' ? '!' : '○'}
                    </span>
                    <div>
                      <div className="text-xs text-slate-200">{n.message}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Pending ₹{n.amount.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              ))}
              {dynamicNotifications.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500">
                  No pending payment alerts.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showRecordPayment && (
        <RecordPaymentModal
          onClose={() => { setShowRecordPayment(false); setRecordModalParams(null); }}
          onSuccess={msg => addToast(msg, 'success')}
          initialClientId={recordModalParams?.clientId}
          initialPaymentType={recordModalParams?.paymentType}
          onAddClient={() => setShowAddClient(true)}
        />
      )}
      {showAddClient && (
        <AddClientModal
          onClose={() => setShowAddClient(false)}
          onSuccess={msg => addToast(msg, 'success')}
        />
      )}
      {showAddDue && (
        <AddDueModal
          onClose={() => setShowAddDue(false)}
          onSuccess={msg => addToast(msg, 'success')}
          onAddClient={() => setShowAddClient(true)}
        />
      )}
      {editingPayment && (
        <EditPaymentModal
          payment={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSuccess={msg => addToast(msg, 'success')}
        />
      )}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSuccess={msg => addToast(msg, 'success')}
        />
      )}

      <ToastContainer toasts={toasts} remove={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <PaymentProvider>
      <AppContent />
    </PaymentProvider>
  );
}
