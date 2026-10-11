import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { voucherService } from '../../services/voucherService';
import { FilterPanel } from '../../components/common/FilterPanel';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  PlusCircle,
  Edit3,
  Trash2,
  Send,
  Eye,
  AlertCircle
} from 'lucide-react';

export const MyVouchersPage = () => {
  const { success, error } = useToast();

  const [vouchers, setVouchers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    category: '',
    department: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Action Modals state
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handleDelete = async () => {
    if (!selectedVoucher) return;
    setActionLoading(true);
    try {
      await voucherService.deleteVoucher(selectedVoucher.id);
      success(`Draft voucher ${selectedVoucher.voucherNumber} deleted`);
      setDeleteModalOpen(false);
      fetchVouchers();
    } catch (err) {
      error(err.message || 'Failed to delete voucher');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitVoucher = async () => {
    if (!selectedVoucher) return;
    setActionLoading(true);
    try {
      await voucherService.submitVoucher(selectedVoucher.id);
      success(`Voucher ${selectedVoucher.voucherNumber} submitted for approval`);
      setSubmitModalOpen(false);
      fetchVouchers();
    } catch (err) {
      error(err.message || 'Failed to submit voucher');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Expense Vouchers
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your claims, edit drafts, and track director approval status
          </p>
        </div>

        <Link
          to="/employee/vouchers/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Voucher</span>
        </Link>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showStatusFilter={true}
        showEmployeeFilter={false}
      />

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Loading your vouchers...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No vouchers found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No matching expense vouchers found. Adjust your search or filter criteria.
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
                  <th className="py-3.5 px-6 font-bold">Expense Title</th>
                  <th className="py-3.5 px-6 font-bold">Category</th>
                  <th className="py-3.5 px-6 font-bold">Expense Date</th>
                  <th className="py-3.5 px-6 font-bold">Amount (₹)</th>
                  <th className="py-3.5 px-6 font-bold">Status</th>
                  <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      <Link
                        to={`/employee/vouchers/${v.id}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {v.voucherNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 max-w-xs truncate">
                      {v.expenseTitle}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{v.expenseCategory}</td>
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
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/employee/vouchers/${v.id}`}
                          title="View Details"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {v.status === 'DRAFT' && (
                          <>
                            <Link
                              to={`/employee/vouchers/${v.id}/edit`}
                              title="Edit Draft"
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => {
                                setSelectedVoucher(v);
                                setSubmitModalOpen(true);
                              }}
                              title="Submit for Approval"
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedVoucher(v);
                                setDeleteModalOpen(true);
                              }}
                              title="Delete Draft"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={(p) => handleFilterChange({ page: p })}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Draft Voucher"
        message={`Are you sure you want to delete draft voucher ${selectedVoucher?.voucherNumber}? This action cannot be undone.`}
        confirmText="Delete Voucher"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Submit Confirmation Modal */}
      <ConfirmationModal
        isOpen={submitModalOpen}
        title="Submit Voucher for Approval"
        message={`Submit ${selectedVoucher?.voucherNumber} for Director review? Once submitted, the voucher cannot be edited.`}
        confirmText="Submit Voucher"
        confirmVariant="success"
        isLoading={actionLoading}
        onConfirm={handleSubmitVoucher}
        onCancel={() => setSubmitModalOpen(false)}
      />
    </div>
  );
};
