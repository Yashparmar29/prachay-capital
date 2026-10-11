import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { voucherService } from '../../services/voucherService';
import { FilterPanel } from '../../components/common/FilterPanel';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';
import { FileText, Eye, ArrowUpDown } from 'lucide-react';

export const AllVouchersPage = () => {
  const { error } = useToast();
  const [vouchers, setVouchers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    category: '',
    department: '',
    employeeName: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await voucherService.getVouchers(filters);
      setVouchers(data.vouchers || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      error(err.message || 'Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      status: '',
      category: '',
      department: '',
      employeeName: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Organization Expense Vouchers
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Complete organizational master record of all expense vouchers across departments
        </p>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showStatusFilter={true}
        showEmployeeFilter={true}
      />

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Loading organization vouchers...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No vouchers found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No vouchers match your current filters. Try resetting the filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              Reset Filters
            </button>
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
                  <th className="py-3.5 px-6 font-bold">Status</th>
                  <th className="py-3.5 px-6 font-bold text-right">View</th>
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
                    <td className="py-4 px-6 font-semibold text-slate-800">
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
                    <td className="py-4 px-6 font-bold text-slate-900 font-mono">
                      ₹{parseFloat(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={v.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/director/vouchers/${v.id}`}
                        className="p-1.5 inline-flex text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
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
          onPageChange={(p) => handleFilterChange({ page: p })}
        />
      </div>
    </div>
  );
};
