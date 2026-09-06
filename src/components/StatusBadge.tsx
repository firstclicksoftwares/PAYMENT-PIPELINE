import type { PaymentStatus } from '../types';
import { statusLabel } from '../data';

const iconMap: Record<string, string> = {
  paid: '✓',
  partially_paid: '◐',
  due: '○',
  overdue: '!',
  upcoming: '→',
};

const classMap: Record<string, string> = {
  paid: 'badge-paid',
  partially_paid: 'badge-partial',
  due: 'badge-due',
  overdue: 'badge-overdue',
  upcoming: 'badge-upcoming',
};

interface Props {
  status: PaymentStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium font-mono-data ${px} ${classMap[status]}`}>
      <span>{iconMap[status]}</span>
      {statusLabel[status]}
    </span>
  );
}
