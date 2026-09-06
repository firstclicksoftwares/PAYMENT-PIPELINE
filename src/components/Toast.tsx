import { useEffect } from 'react';
import type { Toast as ToastType } from '../types';

interface Props {
  toasts: ToastType[];
  remove: (id: string) => void;
}

const icons: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const colors: Record<string, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error: 'border-red-500/30 bg-red-500/10 text-red-300',
  info: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
};

function ToastItem({ toast, remove }: { toast: ToastType; remove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => remove(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, remove]);

  return (
    <div className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md ${colors[toast.type]} text-sm font-medium`}>
      <span className="text-base">{icons[toast.type]}</span>
      <span>{toast.message}</span>
      <button onClick={() => remove(toast.id)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

export default function ToastContainer({ toasts, remove }: Props) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 min-w-72">
      {toasts.map(t => <ToastItem key={t.id} toast={t} remove={remove} />)}
    </div>
  );
}
