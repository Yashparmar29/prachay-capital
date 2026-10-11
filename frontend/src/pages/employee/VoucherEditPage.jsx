import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { voucherService } from '../../services/voucherService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SignatureUploader } from '../../components/common/SignatureUploader';
import {
  ArrowLeft,
  Save,
  Send,
  Calendar,
  IndianRupee,
  Building2,
  Tag,
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

export const VoucherEditPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voucher, setVoucher] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(voucherSchema),
  });

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const data = await voucherService.getVoucherById(id);
        if (data.status !== 'DRAFT') {
          error(`Cannot edit voucher in ${data.status} status. Only Draft vouchers can be edited.`);
          navigate(`/employee/vouchers/${id}`);
          return;
        }

        setVoucher(data);
        reset({
          department: data.department,
          expenseTitle: data.expenseTitle,
          expenseDate: new Date(data.expenseDate).toISOString().split('T')[0],
          expenseCategory: data.expenseCategory,
          expenseDescription: data.expenseDescription || '',
          amount: data.amount,
        });
      } catch (err) {
        error(err.message || 'Failed to load voucher');
        navigate('/employee/vouchers');
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [id, reset, navigate, error]);

  const onSubmit = async (formData, shouldSubmitNow = false) => {
    setSubmitting(true);
    try {
      // 1. Update draft voucher
      const updated = await voucherService.updateVoucher(id, {
        ...formData,
        employeeSignaturePath: voucher.employeeSignaturePath,
      });

      // 2. Upload new signature if attached
      if (signatureFile) {
        await voucherService.uploadSignature(id, signatureFile);
      }

      // 3. Submit if requested
      if (shouldSubmitNow) {
        await voucherService.submitVoucher(id);
        success(`Voucher ${updated.voucherNumber} submitted for approval!`);
      } else {
        success(`Voucher ${updated.voucherNumber} changes saved.`);
      }

      navigate(`/employee/vouchers/${id}`);
    } catch (err) {
      error(err.message || 'Failed to save voucher changes');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/employee/vouchers/${id}`}
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Edit Draft Voucher • {voucher?.voucherNumber}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Modify voucher particulars before formal submission
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Department <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('department')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.department ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.department && (
                <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.department.message}</p>
              )}
            </div>

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

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Expense Title / Particulars <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('expenseTitle')}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.expenseTitle ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {errors.expenseTitle && (
                <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.expenseTitle.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Expense Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  {...register('expenseCategory')}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.amount ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.amount.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Expense Description / Purpose
              </label>
              <textarea
                rows={3}
                {...register('expenseDescription')}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <SignatureUploader
              label="Update Employee Signature"
              currentSignatureUrl={voucher?.employeeSignaturePath}
              onSignatureSelected={setSignatureFile}
            />
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link
              to={`/employee/vouchers/${id}`}
              className="w-full sm:w-auto px-5 py-2.5 text-center text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              Discard Changes
            </Link>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit((data) => onSubmit(data, false))}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-300"
            >
              <Save className="w-4 h-4" />
              <span>Update Draft</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit((data) => onSubmit(data, true))}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-md shadow-blue-500/25"
            >
              <Send className="w-4 h-4" />
              <span>Save & Submit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
