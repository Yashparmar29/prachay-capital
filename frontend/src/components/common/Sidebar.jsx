import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Clock,
  FileCheck2,
  PenTool,
  LogOut,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const getNavLinks = () => {
    switch (user?.role) {
      case 'EMPLOYEE':
        return [
          { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
          { name: 'Create Voucher', path: '/employee/vouchers/create', icon: FilePlus },
          { name: 'My Vouchers', path: '/employee/vouchers', icon: FileText },
          { name: 'My Signature', path: '/employee/signature', icon: PenTool },
        ];
      case 'DIRECTOR':
        return [
          { name: 'Dashboard', path: '/director/dashboard', icon: LayoutDashboard },
          { name: 'Pending Approvals', path: '/director/pending', icon: Clock },
          { name: 'All Vouchers', path: '/director/vouchers', icon: FileText },
        ];
      case 'ACCOUNTS':
        return [
          { name: 'Dashboard', path: '/accounts/dashboard', icon: LayoutDashboard },
          { name: 'All Vouchers', path: '/accounts/vouchers', icon: FileCheck2 },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950/95 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-slate-800/80 backdrop-blur-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-18 flex items-center px-6 gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/30 border border-white/20">
            P
          </div>
          <div>
            <div className="font-black text-white tracking-wider text-sm flex items-center gap-1.5">
              <span>PRACHAY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <div className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">
              {user?.role} PORTAL
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>Main Menu</span>
            <Sparkles className="w-3 h-3 text-slate-600" />
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80 hover:border-slate-800 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-2xl bg-slate-900/60 border border-slate-800/60">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate font-medium">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl bg-slate-900/80 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 transition-all border border-slate-800 hover:border-rose-900/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
