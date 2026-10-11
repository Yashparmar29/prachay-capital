import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrintVoucherView } from '../../components/common/PrintVoucherView';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  Printer,
  ArrowRight,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';

export const AccountsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printingVoucher, setPrintingVoucher] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getStats();
        setData(res);
      } catch (err) {
        console.error('Failed to load Accounts dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentApproved = data?.recentApprovedVouchers || [];

  return (
    <div className="space-y-8">
      {/* Header Banner with Modern Mesh Gradient */}
      <div className="mesh-gradient-banner text-white p-7 sm:p-10 rounded-3xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="relative z-10">
          <span className="shimmer-badge text-xs font-bold text-emerald-200 uppercase tracking-widest bg-emerald-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-400/30 inline-block shadow-sm">
            Accounts & Finance Department
          </span>
          <h1 className="text-2xl sm:text-4xl font-black mt-3 tracking-tight">
            Accounts & Reimbursement Center
          </h1>
          <p className="text-sm text-blue-100/80 mt-1.5 max-w-xl leading-relaxed">
            Monitor verified expense claims, inspect dual electronic signatures, and process payment reimbursements seamlessly.
          </p>
        </div>

        <Link
          to="/accounts/vouchers"
          className="relative z-10 inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0 text-sm"
        >
          <FileCheck2 className="w-5 h-5 text-white" />
          <span>Browse All Vouchers</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Vouchers"
          value={stats.totalVouchers || 0}
          icon={FileText}
          color="blue"
          subtitle="All submissions"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingApproval || 0}
          icon={Clock}
          color="amber"
          subtitle="In Director queue"
        />
        <StatCard
          title="Approved Vouchers"
          value={stats.approvedVouchers || 0}
          icon={CheckCircle}
          color="emerald"
          subtitle="Ready for reimbursement"
        />
        <StatCard
          title="Rejected Vouchers"
          value={stats.rejectedVouchers || 0}
          icon={XCircle}
          color="rose"
          subtitle="Declined claims"
        />
        <StatCard
          title="Approved Expense Amount"
          value={`₹${(stats.totalApprovedAmount || 0).toLocaleString('en-IN', {
            maximumFractionDigits: 0,
          })}`}
          icon={IndianRupee}
          color="purple"
          subtitle="Total approved claims"
        />
      </div>

      {/* Recent Approved Vouchers Ready for Reimbursement */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Approved Vouchers (Ready for Reimbursement)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified by Director with signatures attached
            </p>
          </div>
          <Link
            to="/accounts/vouchers"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentApproved.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-400 text-xs">
            No approved vouchers found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6 font-bold">Voucher #</th>
                  <th className="py-3.5 px-6 font-bold">Employee Name</th>
                  <th className="py-3.5 px-6 font-bold">Department</th>
                  <th className="py-3.5 px-6 font-bold">Expense Title</th>
                  <th className="py-3.5 px-6 font-bold">Amount</th>
                  <th className="py-3.5 px-6 font-bold">Status</th>
                  <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentApproved.map((v) => (
                  <tr key={v.id} className="table-glow-row transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">{v.voucherNumber}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{v.employeeName}</td>
                    <td className="py-4 px-6 text-slate-600">{v.department}</td>
                    <td className="py-4 px-6 text-slate-700 max-w-xs truncate font-medium">
                      {v.expenseTitle}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 font-mono">
                      ₹{parseFloat(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={v.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPrintingVoucher(v)}
                          title="Print / Save Voucher Receipt"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                        <Link
                          to={`/accounts/vouchers/${v.id}`}
                          className="font-bold text-slate-600 hover:text-slate-900 text-xs"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print View Modal */}
      {printingVoucher && (
        <PrintVoucherView
          voucher={printingVoucher}
          onClose={() => setPrintingVoucher(null)}
        />
      )}
    </div>
  );
};
