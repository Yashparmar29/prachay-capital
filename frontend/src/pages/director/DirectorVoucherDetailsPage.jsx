import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { voucherService } from '../../services/voucherService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { VoucherAuditTimeline } from '../../components/common/VoucherAuditTimeline';
import { PrintVoucherView } from '../../components/common/PrintVoucherView';
import { SignatureUploader } from '../../components/common/SignatureUploader';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getSignatureImageUrl } from '../../utils/imageUrl';
import {
  ArrowLeft,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  AlertOctagon,
  X
} from 'lucide-react';

export const DirectorVoucherDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printOpen, setPrintOpen] = useState(false);

  // Approve modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [directorSigFile, setDirectorSigFile] = useState(null);
  const [approving, setApproving] = useState(false);

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchVoucher = async () => {
    setLoading(true);
    try {
      const data = await voucherService.getVoucherById(id);
      setVoucher(data);
    } catch (err) {
      error(err.message || 'Failed to load voucher details');
      navigate('/director/vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucher();
  }, [id]);

  const handleApprove = async () => {
    // If Director has a saved profile signature and didn't draw a new one, use profile signature
    const sigToUse = directorSigFile || user?.signaturePath;

    if (!sigToUse) {
      error('Director signature is mandatory before approval. Please upload or draw your signature.');
      return;
    }

    setApproving(true);
    try {
      await voucherService.approveVoucher(id, sigToUse);
      success(`Voucher ${voucher.voucherNumber} approved successfully!`);
      setApproveModalOpen(false);
      fetchVoucher();
    } catch (err) {
      error(err.message || 'Approval failed');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      error('Rejection reason is mandatory and must be at least 5 characters');
      return;
    }

    setRejecting(true);
    try {
      await voucherService.rejectVoucher(id, rejectionReason.trim());
      success(`Voucher ${voucher.voucherNumber} rejected with remarks.`);
      setRejectModalOpen(false);
      fetchVoucher();
    } catch (err) {
      error(err.message || 'Rejection failed');
    } finally {
      setRejecting(false);
    }
  };

  const getFullImageUrl = (path) => {
    return getSignatureImageUrl(path);
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
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
            to="/director/vouchers"
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
              Claimed by <span className="font-bold text-slate-700">{voucher.employeeName}</span> ({voucher.department})
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

          {voucher.status === 'PENDING_APPROVAL' && (
            <>
              <button
                onClick={() => setRejectModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Voucher</span>
              </button>

              <button
                onClick={() => setApproveModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve & Sign</span>
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
            <h3 className="text-sm font-bold text-rose-900">Rejection Remarks</h3>
            <p className="text-xs sm:text-sm text-rose-800 mt-1 leading-relaxed font-medium">
              "{voucher.rejectionReason}"
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
                Total Reimbursement Claimed
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

      {/* APPROVE MODAL WITH SIGNATURE UPLOAD */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <button
              onClick={() => setApproveModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Approve Voucher</h3>
                <p className="text-xs text-slate-400">Attach Director electronic signature</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl mb-4 text-xs text-slate-600">
              Approving <span className="font-bold text-slate-900">{voucher.voucherNumber}</span> for{' '}
              <span className="font-bold text-slate-900">
                ₹{parseFloat(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>{' '}
              claimed by <span className="font-bold text-slate-900">{voucher.employeeName}</span>.
            </div>

            {/* Signature Uploader */}
            <SignatureUploader
              label="Director Electronic Signature"
              required={true}
              currentSignatureUrl={user?.signaturePath}
              onSignatureSelected={setDirectorSigFile}
            />
            {user?.signaturePath && !directorSigFile && (
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                ✓ Defaulting to your registered Director signature.
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                disabled={approving}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-60 transition-all"
              >
                {approving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Confirm & Sign Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL WITH REASON */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reject Expense Voucher</h3>
                <p className="text-xs text-slate-400">A clear rejection reason is mandatory</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Rejection Remarks / Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this reimbursement is rejected (e.g., Original receipt missing, policy limit exceeded, missing travel authorization memo)..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <p className="text-[11px] text-slate-400">
                Minimum 5 characters. This explanation will be displayed to {voucher.employeeName} on their dashboard.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                disabled={rejecting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={rejecting || rejectionReason.trim().length < 5}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 disabled:opacity-50 transition-all"
              >
                {rejecting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print View Modal */}
      {printOpen && (
        <PrintVoucherView voucher={voucher} onClose={() => setPrintOpen(false)} />
      )}
    </div>
  );
};
