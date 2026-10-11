import React from 'react';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { getSignatureImageUrl } from '../../utils/imageUrl';

export const PrintVoucherView = ({ voucher, onClose }) => {
  if (!voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const getFullImageUrl = (path) => {
    return getSignatureImageUrl(path);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Controls - Hidden during Print */}
        <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">Voucher Print Preview</span>
            <span className="text-xs text-slate-500 font-medium">
              (Use printer or Save as PDF)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINT CONTAINER - Formatted Corporate Voucher Document */}
        <div className="print-container bg-white p-6 border border-slate-200 rounded-xl">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-blue-700 text-white font-black text-xl flex items-center justify-center">
                  P
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                    PRACHAY CAPITAL
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-500 tracking-wider">
                    PRACHAY SECURITIES PRIVATE LIMITED
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Corporate Finance & Accounts Department • Official Expense Reimbursement Voucher
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
                EXPENSE VOUCHER
              </div>
              <div className="mt-2 text-sm font-mono font-bold text-slate-900">
                {voucher.voucherNumber}
              </div>
              <div className="mt-1">
                <StatusBadge status={voucher.status} size="sm" />
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">
                Voucher Date
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {formatDate(voucher.voucherDate || voucher.createdAt)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">
                Expense Incurred Date
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {formatDate(voucher.expenseDate)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">
                Department
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {voucher.department}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">
                Expense Category
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {voucher.expenseCategory}
              </span>
            </div>
          </div>

          {/* Employee Details */}
          <div className="py-4 border-b border-slate-200 text-xs">
            <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px] mb-1">
              Claimant Employee Details
            </span>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 text-sm">{voucher.employeeName}</span>
                {voucher.employeeCode && (
                  <span className="ml-2 font-mono text-slate-500 font-semibold">
                    ({voucher.employeeCode})
                  </span>
                )}
              </div>
              <div className="text-slate-600">
                Department: <span className="font-semibold">{voucher.department}</span>
              </div>
            </div>
          </div>

          {/* Expense Description Table */}
          <div className="py-6 border-b border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2 font-semibold">Expense Particulars / Title</th>
                  <th className="py-2 font-semibold">Category</th>
                  <th className="py-2 font-semibold text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 pr-4">
                    <p className="font-bold text-slate-900 text-sm">{voucher.expenseTitle}</p>
                    {voucher.expenseDescription && (
                      <p className="text-slate-600 mt-1 text-xs leading-relaxed">
                        {voucher.expenseDescription}
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-slate-700 font-medium align-top">
                    {voucher.expenseCategory}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900 text-base align-top">
                    ₹{parseFloat(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900">
                  <th colSpan="2" className="pt-3 text-sm font-bold text-slate-900 uppercase">
                    Total Reimbursement Claimed
                  </th>
                  <th className="pt-3 text-right font-mono font-bold text-lg text-blue-700">
                    ₹{parseFloat(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures & Approvals Section */}
          <div className="pt-6 grid grid-cols-2 gap-6">
            {/* Claimant Signature */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Claimant Signature
              </span>
              <div className="h-20 flex items-center justify-center bg-white border border-slate-200 rounded-lg p-2 mb-2">
                {voucher.employeeSignaturePath ? (
                  <img
                    src={getFullImageUrl(voucher.employeeSignaturePath)}
                    alt="Employee Signature"
                    className="max-h-16 object-contain"
                  />
                ) : (
                  <span className="text-slate-300 text-xs italic">No signature attached</span>
                )}
              </div>
              <div className="text-[11px] text-slate-600 font-semibold truncate">
                {voucher.employeeName}
              </div>
              <div className="text-[10px] text-slate-400">
                Date: {formatDate(voucher.voucherDate || voucher.createdAt)}
              </div>
            </div>

            {/* Director Approval Signature */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Director Approval Signature
              </span>
              <div className="h-20 flex items-center justify-center bg-white border border-slate-200 rounded-lg p-2 mb-2">
                {voucher.directorSignaturePath ? (
                  <img
                    src={getFullImageUrl(voucher.directorSignaturePath)}
                    alt="Director Signature"
                    className="max-h-16 object-contain"
                  />
                ) : (
                  <span className="text-slate-300 text-xs italic">
                    {voucher.status === 'APPROVED' ? 'Verified Electronically' : 'Pending Approval'}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-600 font-semibold truncate">
                {voucher.director?.name || (voucher.status === 'APPROVED' ? 'Director' : 'Pending')}
              </div>
              <div className="text-[10px] text-slate-400">
                Approval Date: {formatDate(voucher.approvalDate)}
              </div>
            </div>
          </div>

          {/* Accounts Reimbursement Seal & Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <div>Processed through Prachay Capital Digital Voucher Portal</div>
            <div className="font-mono">Verified by Accounts Team • Payment Release Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
};
