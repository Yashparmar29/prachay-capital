import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { voucherService } from '../../services/voucherService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SignatureUploader } from '../../components/common/SignatureUploader';
import {
  FilePlus,
  ArrowLeft,
  Save,
  Send,
  Calendar,
  IndianRupee,
  Building2,
  Tag,
  AlignLeft,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'Travel',
  'Food',
  'Accommodation',
  'Office Supplies',
  'Software',
  'Training',
  'Other'
];

const voucherSchema = z.object({
  department: z.string().trim().min(1, 'Department name is mandatory'),
  expenseTitle: z.string().trim().min(1, 'Expense title is mandatory'),
  expenseDate: z.string().min(1, 'Expense date is mandatory').refine(
    (val) => {
      const d = new Date(val);
      const now = new Date();
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      return d <= endOfToday;
    },
    { message: 'Expense date cannot be in the future' }
  ),
  expenseCategory: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid expense category' }),
  }),
  expenseDescription: z.string().trim().optional(),
  amount: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'number' ? val : parseFloat(val)))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Amount must be greater than zero',
    })
    .refine(
      (val) => {
        const parts = val.toString().split('.');
        return !parts[1] || parts[1].length <= 2;
      },
      { message: 'Amount can have at most 2 decimal places' }
    ),
});

export const VoucherCreatePage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [signatureFile, setSignatureFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Default to today's date
  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      department: user?.department || '',
      expenseTitle: '',
      expenseDate: todayStr,
      expenseCategory: 'Travel',
      expenseDescription: '',
      amount: '',
    },
  });

  const onSubmit = async (data, shouldSubmitNow = false) => {
    setSubmitting(true);
    try {
      // 1. Create draft voucher
      const payload = {
        ...data,
        employeeSignaturePath: user?.signaturePath || null,
      };

      const created = await voucherService.createVoucher(payload);

      // 2. If a new signature file was attached, upload it to the voucher
      if (signatureFile) {
        await voucherService.uploadSignature(created.id, signatureFile);
      }

      // 3. If "Save & Submit" was clicked, trigger submission immediately
      if (shouldSubmitNow) {
        await voucherService.submitVoucher(created.id);
        success(`Voucher ${created.voucherNumber} submitted for Director approval!`);
        navigate('/employee/vouchers');
      } else {
        success(`Voucher ${created.voucherNumber} saved as Draft.`);
        navigate('/employee/vouchers');
      }
    } catch (err) {
      error(err.message || 'Failed to create voucher');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/employee/vouchers"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Create Expense Voucher
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill in the expense details to request corporate reimbursement
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Department <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('department')}
                  placeholder="e.g. Engineering"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.department ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.department && (
                <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.department.message}</p>
              )}
            </div>

            {/* Expense Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Expense Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  max={todayStr}
                  {...register('expenseDate')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.expenseDate ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.expenseDate && (
                <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.expenseDate.message}</p>
              )}
            </div>

            {/* Expense Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Expense Title / Particulars <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('expenseTitle')}
                placeholder="e.g. Flight Tickets Bangalore to Delhi Client Meeting"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.expenseTitle ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {errors.expenseTitle && (
                <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.expenseTitle.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Expense Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  {...register('expenseCategory')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer ${
                    errors.expenseCategory ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {errors.expenseCategory && (
                <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.expenseCategory.message}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Amount (INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('amount')}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.amount ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.amount.message}</p>
              )}
            </div>

            {/* Expense Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Expense Description / Purpose
              </label>
              <textarea
                rows={3}
                {...register('expenseDescription')}
                placeholder="Provide details regarding the business need, attendee names, or receipt reference..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Signature Section */}
          <div className="pt-4 border-t border-slate-100">
            <SignatureUploader
              label="Employee Signature"
              currentSignatureUrl={user?.signaturePath}
              onSignatureSelected={setSignatureFile}
            />
            {user?.signaturePath && !signatureFile && (
              <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
                ✓ Using your saved profile signature by default. (You can upload or draw a different one if desired).
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link
              to="/employee/vouchers"
              className="w-full sm:w-auto px-5 py-2.5 text-center text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit((data) => onSubmit(data, false))}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-300 shadow-2xs"
            >
              <Save className="w-4 h-4" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit((data) => onSubmit(data, true))}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-md shadow-blue-500/25"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Submit for Approval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
