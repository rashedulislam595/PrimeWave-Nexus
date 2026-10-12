import React from 'react';
import { ReservationStatus, ResourceStatus } from '@/types';

interface StatusBadgeProps {
  status: ReservationStatus | ResourceStatus | string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStyles = () => {
    switch (status) {
      case 'APPROVED':
      case 'AVAILABLE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'REJECTED':
      case 'CANCELLED':
      case 'RETIRED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'MAINTENANCE':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getDot = () => {
    switch (status) {
      case 'APPROVED':
      case 'AVAILABLE':
        return 'bg-emerald-400 animate-pulse';
      case 'PENDING':
        return 'bg-amber-400';
      case 'COMPLETED':
        return 'bg-blue-400';
      case 'REJECTED':
      case 'CANCELLED':
      case 'RETIRED':
        return 'bg-rose-400';
      case 'MAINTENANCE':
        return 'bg-orange-400';
      default:
        return 'bg-slate-400';
    }
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${getStyles()} ${pad}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDot()}`} />
      <span className="capitalize">{status.toLowerCase()}</span>
    </span>
  );
}
