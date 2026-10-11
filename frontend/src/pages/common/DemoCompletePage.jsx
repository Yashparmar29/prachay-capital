import React from 'react';
import { CheckCircle2, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DemoCompletePage = () => {
  return (
    <div className="min-h-screen aurora-mesh flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-xl w-full bg-white/95 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-white/60 glow-rim floating-element">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Expense Voucher Management System
        </h1>
        <p className="mt-3 text-lg font-bold text-gradient-brand">
          Demo Complete
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-bold text-slate-700 block">Employee</span>
            <span className="text-[11px] text-emerald-600 font-semibold">Created & Signed</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-bold text-slate-700 block">Director</span>
            <span className="text-[11px] text-purple-600 font-semibold">Reviewed & Approved</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-bold text-slate-700 block">Accounts</span>
            <span className="text-[11px] text-blue-600 font-semibold">Verified & Printed</span>
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/25"
          >
            <span>Return to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
