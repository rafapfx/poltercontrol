import { PolterStatus } from '@/lib/types';

const statusConfig: Record<PolterStatus, { bg: string; text: string }> = {
  'Neu': { bg: 'bg-gray-100', text: 'text-gray-600' },
  'Bereit': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Transport zugewiesen': { bg: 'bg-blue-50', text: 'text-blue-700' },
  'Abgeholt': { bg: 'bg-amber-50', text: 'text-amber-700' },
  'Geliefert': { bg: 'bg-primary/10', text: 'text-primary' },
};

const StatusBadge = ({ status }: { status: PolterStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
