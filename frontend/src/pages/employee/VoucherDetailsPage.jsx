import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { voucherService } from '../../services/voucherService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { VoucherAuditTimeline } from '../../components/common/VoucherAuditTimeline';
import { PrintVoucherView } from '../../components/common/PrintVoucherView';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { getSignatureImageUrl } from '../../utils/imageUrl';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Tag,
  IndianRupee,
  Clock,
  Printer,
  Edit3,
  Send,
  AlertOctagon,
  CheckCircle2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const VoucherDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printOpen, setPrintOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchVoucher = async () => {
    setLoading(true);
    try {
      const data = await voucherService.getVoucherById(id);
      setVoucher(data);
    } catch (err) {
      error(err.message || 'Failed to fetch voucher details');
      navigate('/employee/vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucher();
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await voucherService.submitVoucher(id);
      success('Voucher submitted successfully for Director approval!');
      setSubmitModalOpen(false);
      fetchVoucher();
    } catch (err) {
      error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getFullImageUrl = (path) => {
    return getSignatureImageUrl(path);
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!voucher) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/employee/vouchers"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                {voucher.voucherNumber}
              </h1>
              <StatusBadge status={voucher.status} size="md" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Created on{' '}
              {new Date(voucher.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setPrintOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print View</span>
          </button>

          {voucher.status === 'DRAFT' && (
            <>
              <Link
                to={`/employee/vouchers/${voucher.id}/edit`}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Draft</span>
              </Link>

              <button
                onClick={() => setSubmitModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Submit for Approval</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* REJECTION REASON ALERT (If Rejected) */}
      {voucher.status === 'REJECTED' && voucher.rejectionReason && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 sm:p-6 text-rose-900 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-900">Rejection Reason Provided by Director</h3>
            <p className="text-xs sm:text-sm text-rose-800 mt-1.5 leading-relaxed font-medium">
              "{voucher.rejectionReason}"
            </p>
            <p className="text-[11px] text-rose-600/80 mt-2">
              Note: This voucher is final and read-only. If needed, please submit a new corrected voucher.
            </p>
          </div>
        </div>
      )}

      {/* Main Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Voucher Particulars */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Expense Particulars
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {voucher.expenseTitle}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Expense Date</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {new Date(voucher.expenseDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Category</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {voucher.expenseCategory}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {voucher.department}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Detailed Purpose / Description
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {voucher.expenseDescription || 'No description entered.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Claim Amount
              </span>
              <span className="text-2xl font-black text-blue-700 font-mono">
                ₹{parseFloat(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Signatures Verified Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Electronic Signature Verification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Employee Signature */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-600">Employee Signature</span>
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="h-20 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center">
                  {voucher.employeeSignaturePath ? (
                    <img
                      src={getFullImageUrl(voucher.employeeSignaturePath)}
                      alt="Employee Signature"
                      className="max-h-16 object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-300 italic">No signature attached</span>
                  )}
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-800">{voucher.employeeName}</div>
              </div>

              {/* Director Signature */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-600">Director Signature</span>
                  {voucher.status === 'APPROVED' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div className="h-20 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center">
                  {voucher.directorSignaturePath ? (
                    <img
                      src={getFullImageUrl(voucher.directorSignaturePath)}
                      alt="Director Signature"
                      className="max-h-16 object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-300 italic">
                      {voucher.status === 'APPROVED' ? 'Verified' : 'Pending Approval'}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-800">
                  {voucher.director?.name || (voucher.status === 'APPROVED' ? 'Director' : 'Pending Review')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workflow History */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Workflow Status History
            </h3>
          </div>

          <VoucherAuditTimeline history={voucher.statusHistory || []} />
        </div>
      </div>

      {/* Print View Modal */}
      {printOpen && (
        <PrintVoucherView voucher={voucher} onClose={() => setPrintOpen(false)} />
      )}

      {/* Submit Confirmation Modal */}
      <ConfirmationModal
        isOpen={submitModalOpen}
        title="Submit Voucher for Approval"
        message={`Confirm submission of voucher ${voucher.voucherNumber}? It will be forwarded immediately to the Director for approval.`}
        confirmText="Confirm & Submit"
        confirmVariant="success"
        isLoading={submitting}
        onConfirm={handleSubmit}
        onCancel={() => setSubmitModalOpen(false)}
      />
    </div>
  );
};
