import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  FileText,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const DirectorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getStats();
        setData(res);
      } catch (err) {
        console.error('Failed to load Director dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recent = data?.recentActivity || [];

  return (
    <div className="space-y-8">
      {/* Header Banner with Modern Mesh Gradient */}
      <div className="mesh-gradient-banner text-white p-7 sm:p-10 rounded-3xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="relative z-10">
          <span className="shimmer-badge text-xs font-bold text-purple-200 uppercase tracking-widest bg-purple-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-purple-400/30 inline-block shadow-sm">
            Director (Admin) Console
          </span>
          <h1 className="text-2xl sm:text-4xl font-black mt-3 tracking-tight">
            Executive Approval Center
          </h1>
          <p className="text-sm text-purple-100/80 mt-1.5 max-w-xl leading-relaxed">
            Review pending employee expense reimbursements, inspect electronic signatures, and manage organizational sign-offs.
          </p>
        </div>

        <Link
          to="/director/pending"
          className="relative z-10 inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0 text-sm"
        >
          <Clock className="w-5 h-5 text-slate-950" />
          <span>Review Pending Approvals ({stats.pendingApprovalCount || 0})</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovalCount || 0}
          icon={Clock}
          color="amber"
          subtitle="Awaiting your electronic sign-off"
        />
        <StatCard
          title="Total Pending Amount"
          value={`₹${(stats.totalPendingAmount || 0).toLocaleString('en-IN', {
            maximumFractionDigits: 0,
          })}`}
          icon={IndianRupee}
          color="blue"
          subtitle="Pending reimbursement value"
        />
        <StatCard
          title="Approved Today"
          value={stats.approvedToday || 0}
          icon={CheckCircle}
          color="emerald"
          subtitle="Signed and forwarded to Accounts"
        />
        <StatCard
          title="Rejected Today"
          value={stats.rejectedToday || 0}
          icon={XCircle}
          color="rose"
          subtitle="Returned with feedback"
        />
        <StatCard
          title="Total Organization Vouchers"
          value={stats.totalVouchers || 0}
          icon={FileText}
          color="purple"
          subtitle="Across all departments"
        />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Voucher Activity</h2>
            <p className="text-xs text-slate-400 mt-0.5">Recently updated expense claims across all employees</p>
          </div>
          <Link
            to="/director/vouchers"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
          >
            <span>View All Vouchers</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-400 text-xs">
            No recent voucher activity found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6 font-bold">Voucher #</th>
                  <th className="py-3.5 px-6 font-bold">Employee</th>
                  <th className="py-3.5 px-6 font-bold">Department</th>
                  <th className="py-3.5 px-6 font-bold">Expense Title</th>
                  <th className="py-3.5 px-6 font-bold">Amount</th>
                  <th className="py-3.5 px-6 font-bold">Status</th>
                  <th className="py-3.5 px-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recent.map((v) => (
                  <tr key={v.id} className="table-glow-row transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">{v.voucherNumber}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{v.employeeName}</td>
                    <td className="py-4 px-6 text-slate-600">{v.department}</td>
                    <td className="py-4 px-6 text-slate-700 max-w-xs truncate">{v.expenseTitle}</td>
                    <td className="py-4 px-6 font-bold text-slate-900 font-mono">
                      ₹{parseFloat(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={v.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/director/vouchers/${v.id}`}
                        className="font-bold text-blue-600 hover:text-blue-800"
                      >
                        {v.status === 'PENDING_APPROVAL' ? 'Review & Sign' : 'Inspect'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
