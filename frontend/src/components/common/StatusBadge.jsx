import React from 'react';

const STATUS_CONFIG = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-100/90',
    text: 'text-slate-700',
    border: 'border-slate-300/80',
    dot: 'bg-slate-500',
    glow: 'shadow-slate-500/10'
  },
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-sky-50/90',
    text: 'text-sky-700',
    border: 'border-sky-300/80',
    dot: 'bg-sky-500',
    glow: 'shadow-sky-500/15'
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    bg: 'bg-amber-50/90',
    text: 'text-amber-800',
    border: 'border-amber-300/80',
    dot: 'bg-amber-500',
    glow: 'shadow-amber-500/20',
    isPending: true
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-emerald-50/90',
    text: 'text-emerald-800',
    border: 'border-emerald-300/80',
    dot: 'bg-emerald-500',
    glow: 'shadow-emerald-500/20'
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-50/90',
    text: 'text-rose-800',
    border: 'border-rose-300/80',
    dot: 'bg-rose-500',
    glow: 'shadow-rose-500/20'
  }
};

export const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-gray-100/90',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    glow: 'shadow-none'
  };

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-0.5 text-[11px]'
    : size === 'lg'
    ? 'px-4 py-1 text-sm font-semibold'
    : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border backdrop-blur-md shadow-sm ${config.bg} ${config.text} ${config.border} ${config.glow} ${sizeClasses} transition-all duration-200`}
    >
      <span className="relative flex h-2 w-2">
        {config.isPending && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      <span>{config.label}</span>
    </span>
  );
};
