import React from 'react';
import { StatusBadge } from './StatusBadge';
import { Clock, User, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const VoucherAuditTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        No status history recorded yet.
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-emerald-500">
      {history.map((event, idx) => {
        const isLatest = idx === 0;
        const isApproved = event.toStatus === 'APPROVED';
        const isRejected = event.toStatus === 'REJECTED';

        return (
          <div key={event.id || idx} className="relative group">
            {/* Glowing Pipeline Node Dot */}
            <div
              className={`absolute -left-7 top-1.5 w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-110 ${
                isApproved
                  ? 'bg-emerald-500 text-white pulse-ring-emerald'
                  : isRejected
                  ? 'bg-rose-500 text-white'
                  : isLatest
                  ? 'bg-blue-600 text-white radar-dot-pulse'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {isApproved ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : isRejected ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>

            {/* Glassmorphic Event Card */}
            <div
              className={`relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 hover-lift-card ${
                isLatest
                  ? 'bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 border-blue-200/80 shadow-md shadow-blue-500/5'
                  : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {isLatest && (
                <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-wider rounded-bl-xl shadow-2xs flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Current State
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 tracking-tight">
                    {event.fromStatus === 'NONE' ? 'Created' : `${event.fromStatus} →`}
                  </span>
                  <StatusBadge status={event.toStatus} size="sm" />
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formatDate(event.createdAt)}</span>
                </div>
              </div>

              {event.remarks && (
                <p className="text-xs text-slate-600 mt-2 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 leading-relaxed font-normal">
                  {event.remarks}
                </p>
              )}

              {event.user && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <User className="w-3 h-3 text-blue-500" />
                    <span>
                      {event.user.name}{' '}
                      <span className="text-slate-400 font-normal">({event.user.role})</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                    ID: {event.user.id?.slice(-4) || 'AUTH'}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

