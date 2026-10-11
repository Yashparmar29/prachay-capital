import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

export const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'DIRECTOR':
        return (
          <span className="shimmer-badge px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-purple-500/10 text-purple-700 border border-purple-200 shadow-2xs">
            Director
          </span>
        );
      case 'ACCOUNTS':
        return (
          <span className="shimmer-badge px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/10 text-blue-700 border border-blue-200 shadow-2xs">
            Accounts
          </span>
        );
      default:
        return (
          <span className="shimmer-badge px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-200 shadow-2xs">
            Employee
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/25 border border-white/20">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg">
                Prachay Capital
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider">
                Expense Portal
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* User profile dropdown / info */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200/80">
          <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm font-bold text-slate-900 leading-none">{user?.name}</span>
              {getRoleBadge(user?.role)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-none font-medium">
              {user?.department}
            </p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 flex items-center justify-center text-slate-700 font-black text-sm shadow-2xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
