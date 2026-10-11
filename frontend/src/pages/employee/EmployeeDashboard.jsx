import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  FileEdit,
  IndianRupee,
  PlusCircle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getStats();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recent = data?.recentVouchers || [];

  return (
    <div className="space-y-8">
      {/* Welcome & Action Header with Modern Mesh Gradient */}
      <div className="mesh-gradient-banner text-white p-7 sm:p-10 rounded-3xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="relative z-10">
          <span className="shimmer-badge text-xs font-bold text-blue-200 uppercase tracking-widest bg-blue-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-blue-400/30 inline-block shadow-sm">
            Employee Portal • {user?.department}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black mt-3 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200">{user?.name}</span>!
          </h1>
          <p className="text-sm text-blue-100/80 mt-1.5 max-w-xl leading-relaxed">
            Create, manage, and track your reimbursement expense vouchers with complete transparency and real-time status updates.
          </p>
        </div>

        <Link
          to="/employee/vouchers/create"
          className="relative z-10 inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-blue-900 hover:bg-blue-50 hover:shadow-blue-500/20 font-bold rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0 text-sm"
        >
          <PlusCircle className="w-5 h-5 text-blue-600" />
          <span>Create New Voucher</span>
        </Link>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Vouchers"
          value={stats.totalVouchers || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Draft Vouchers"
          value={stats.draftVouchers || 0}
          icon={FileEdit}
          color="slate"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingApproval || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Approved Vouchers"
          value={stats.approvedVouchers || 0}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Rejected Vouchers"
          value={stats.rejectedVouchers || 0}
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Total Claimed"
          value={`₹${(stats.totalAmountClaimed || 0).toLocaleString('en-IN', {
            maximumFractionDigits: 0,
          })}`}
          icon={IndianRupee}
          color="purple"
        />
      </div>

      {/* Recent Vouchers Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Vouchers</h2>
            <p className="text-xs text-slate-400 mt-0.5">Your latest submitted and draft expenses</p>
          </div>
          <Link
            to="/employee/vouchers"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-slate-500 text-sm font-medium">No expense vouchers created yet.</p>
            <Link
              to="/employee/vouchers/create"
              className="mt-3 inline-block text-xs font-bold text-blue-600 hover:underline"
            >
              Submit your first expense claim →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6 font-bold">Voucher #</th>
                  <th className="py-3.5 px-6 font-bold">Expense Title</th>
                  <th className="py-3.5 px-6 font-bold">Category</th>
                  <th className="py-3.5 px-6 font-bold">Date</th>
                  <th className="py-3.5 px-6 font-bold">Amount</th>
                  <th className="py-3.5 px-6 font-bold">Status</th>
                  <th className="py-3.5 px-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recent.map((v) => (
                  <tr key={v.id} className="table-glow-row transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">{v.voucherNumber}</td>
                    <td className="py-4 px-6 text-slate-800 font-semibold max-w-xs truncate">
                      {v.expenseTitle}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{v.expenseCategory}</td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(v.expenseDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 font-mono">
                      ₹{parseFloat(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={v.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/employee/vouchers/${v.id}`}
                        className="font-bold text-blue-600 hover:text-blue-800"
                      >
                        Details
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
