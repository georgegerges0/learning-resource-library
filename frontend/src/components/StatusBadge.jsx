import React from 'react';

const STYLES = {
  Draft: {
    badge: 'bg-amber-50 text-amber-900 border-amber-300',
    dot: 'bg-amber-500',
    label: 'Draft',
  },
  Published: {
    badge: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    dot: 'bg-emerald-600',
    label: 'Published',
  },
  Archived: {
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
    label: 'Archived',
  },
  Saved: {
    badge: 'bg-indigo-50 text-indigo-900 border-indigo-300',
    dot: 'bg-indigo-600',
    label: 'Saved',
  },
};

const StatusBadge = ({ status }) => {
  const config = STYLES[status] || STYLES.Draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
