import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { voucherService } from '../../services/voucherService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ArrowRight,
  ShieldCheck,
  Search,
  Building2
} from 'lucide-react';

export const PendingApprovalsPage = () => {
  const { error } = useToast();
  const [vouchers, setVouchers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPending = async (page = 1) => {
    setLoading(true);
    try {
      const data = await voucherService.getPendingVouchers({
        page,
        limit: 10,
        search,
      });
      setVouchers(data.vouchers || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      error(err.message || 'Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending(pagination.page);
  }, [pagination.page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPending(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pending Approval Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {pagination.total} pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Expense vouchers awaiting executive review, verification, and electronic signature sign-off
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pending vouchers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Loading pending approval queue...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Pending Approvals!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All employee vouchers have been reviewed and acted upon. Great job!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6 font-bold">Voucher #</th>
                  <th className="py-3.5 px-6 font-bold">Employee Name</th>
                  <th className="py-3.5 px-6 font-bold">Department</th>
                  <th className="py-3.5 px-6 font-bold">Expense Title</th>
                  <th className="py-3.5 px-6 font-bold">Expense Date</th>
                  <th className="py-3.5 px-6 font-bold">Amount (₹)</th>
                  <th className="py-3.5 px-6 font-bold text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      <Link
                        to={`/director/vouchers/${v.id}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {v.voucherNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {v.employeeName}
                      {v.employeeCode && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {v.employeeCode}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{v.department}</td>
                    <td className="py-4 px-6 text-slate-800 max-w-xs truncate font-medium">
                      {v.expenseTitle}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono">
                      {new Date(v.expenseDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 font-mono text-sm">
                      ₹{parseFloat(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/director/vouchers/${v.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                      >
                        <span>Review & Decide</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />
      </div>
    </div>
  );
};
