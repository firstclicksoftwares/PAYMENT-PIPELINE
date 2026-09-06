import { useState, useCallback } from 'react';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/Clients';
import PaymentPipelinePage from './pages/PaymentPipeline';
import UpcomingDues from './pages/UpcomingDues';
import PaymentHistory from './pages/PaymentHistory';
import Reports from './pages/Reports';
import RecordPaymentModal from './components/RecordPaymentModal';
import AddClientModal from './components/AddClientModal';
import ToastContainer from './components/Toast';
import type { Toast } from './types';

type Page = 'dashboard' | 'clients' | 'pipeline' | 'upcoming' | 'history' | 'reports' | 'settings';

const navItems: { key: Page; label: string; icon: string; sub?: { key: string; label: string }[] }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '▦' },
  { key: 'clients', label: 'Clients', icon: '👥' },
  {
    key: 'pipeline',
    label: 'Payment Pipeline',
    icon: '⟶',
    sub: [{ key: 'website', label: 'Website' }, { key: 'social', label: 'Social Media' }],
  },
  { key: 'upcoming', label: 'Upcoming Dues', icon: '⏰' },
  { key: 'history', label: 'Payment History', icon: '📋' },
  { key: 'reports', label: 'Reports', icon: '📊' },
  { key: 'settings', label: 'Settings', icon: '⚙' },
];

const notifications = [
  { id: 'n1', message: 'Vikram Singh payment overdue', type: 'overdue', amount: 15000 },
  { id: 'n2', message: 'Metro Gym Social Media overdue', type: 'overdue', amount: 5000 },
  { id: 'n3', message: 'Arjun Mehta Social due Oct 10', type: 'due', amount: 4000 },
];

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pipelineExpanded, setPipelineExpanded] = useState(false);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard onRecordPayment={() => setShowRecordPayment(true)} />;
      case 'clients':
        return <ClientsPage onAddClient={() => setShowAddClient(true)} onRecordPayment={() => setShowRecordPayment(true)} />;
      case 'pipeline':
        return <PaymentPipelinePage onRecordPayment={() => setShowRecordPayment(true)} />;
      case 'upcoming':
        return <UpcomingDues onRecordPayment={() => setShowRecordPayment(true)} />;
      case 'history':
        return <PaymentHistory />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-white mb-2">Settings</h1>
            <p className="text-slate-500 text-sm">Agency preferences and configuration.</p>
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">FC</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">FIRST CLICK</div>
              <div className="text-[10px] text-slate-600 uppercase tracking-wider">Payment Hub</div>
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
                    ${isActive ? 'nav-active text-violet-300' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'}`}
                >
                  <span className="text-base w-5 text-center shrink-0 leading-none">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                  {item.sub && (
                    <span className={`ml-auto text-[10px] transition-transform ${(isActive || pipelineExpanded) ? 'rotate-90' : ''}`}>▶</span>
                  )}
                </button>
                {item.sub && (isActive || pipelineExpanded) && (
                  <div className="ml-8 mt-0.5 space-y-0.5">
                    {item.sub.map(s => (
                      <div key={s.key} className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:text-violet-300 cursor-pointer rounded-md hover:bg-white/[0.03] transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                        {s.label}
                      </div>
                    ))}
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
            <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {notifications.length}
            </span>
          </button>

          {/* Admin */}
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-300 truncate">Admin</div>
              <div className="text-[10px] text-slate-600 truncate">admin@firstclick.in</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-[#09090f]/95 border-b border-white/[0.05] flex items-center justify-between px-6 shrink-0 backdrop-blur-sm">
          <div className="text-sm text-slate-600 capitalize">
            {navItems.find(n => n.key === page)?.label || ''}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddClient(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-medium rounded-lg transition-colors border border-white/[0.07]"
            >
              + Add Client
            </button>
            <button
              onClick={() => setShowRecordPayment(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors"
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
            className="absolute bottom-20 left-56 ml-2 w-72 glass rounded-xl overflow-hidden shadow-2xl shadow-black/50"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Notifications</span>
              <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white text-sm">✕</button>
            </div>
            {notifications.map(n => (
              <div key={n.id} className="px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03]">
                <div className="flex items-start gap-2">
                  <span className={`text-sm ${n.type === 'overdue' ? 'text-red-400' : 'text-amber-400'}`}>
                    {n.type === 'overdue' ? '!' : '○'}
                  </span>
                  <div>
                    <div className="text-xs text-slate-200">{n.message}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">₹{n.amount.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showRecordPayment && (
        <RecordPaymentModal
          onClose={() => setShowRecordPayment(false)}
          onSuccess={msg => addToast(msg, 'success')}
        />
      )}
      {showAddClient && (
        <AddClientModal
          onClose={() => setShowAddClient(false)}
          onSuccess={msg => addToast(msg, 'success')}
        />
      )}

      <ToastContainer toasts={toasts} remove={removeToast} />
    </div>
  );
}
