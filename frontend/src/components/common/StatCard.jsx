import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  className = '',
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-500/10 text-blue-600 border-blue-200/60 shadow-blue-500/15',
      glow: 'from-blue-500/20 to-indigo-500/5',
      accent: 'text-blue-600',
      badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-600 border-amber-200/60 shadow-amber-500/15',
      glow: 'from-amber-500/20 to-orange-500/5',
      accent: 'text-amber-600',
      badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
    },
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60 shadow-emerald-500/15',
      glow: 'from-emerald-500/20 to-teal-500/5',
      accent: 'text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-600 border-rose-200/60 shadow-rose-500/15',
      glow: 'from-rose-500/20 to-pink-500/5',
      accent: 'text-rose-600',
      badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    },
    slate: {
      bg: 'bg-slate-500/10 text-slate-600 border-slate-200/60 shadow-slate-500/15',
      glow: 'from-slate-500/20 to-gray-500/5',
      accent: 'text-slate-600',
      badge: 'bg-slate-50 text-slate-700 border-slate-200/80',
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-600 border-purple-200/60 shadow-purple-500/15',
      glow: 'from-purple-500/20 to-indigo-500/5',
      accent: 'text-purple-600',
      badge: 'bg-purple-50 text-purple-700 border-purple-200/80',
    },
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`glass-panel hover-lift-card spotlight-card glow-rim relative p-6 rounded-3xl overflow-hidden group border transition-all duration-300 ${className}`}
    >
      {/* Ambient background glow orb */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${currentTheme.glow} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight font-mono">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:scale-110 ${currentTheme.bg}`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="relative z-10 mt-4 pt-3 border-t border-slate-100/80 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
          {trend}
        </div>
      )}
    </div>
  );
};
