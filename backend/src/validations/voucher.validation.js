const { z } = require('zod');
const { EXPENSE_CATEGORIES } = require('../config/constants');

// Check that date is not in the future
const isNotFutureDate = (val) => {
  const inputDate = new Date(val);
  const now = new Date();
  // Allow today regardless of time (compare date strings or end of day)
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return inputDate <= endOfToday;
};

// Validate amount: positive and max 2 decimal places
const isValidAmount = (val) => {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num) || num <= 0) return false;
  const parts = num.toString().split('.');
  return !parts[1] || parts[1].length <= 2;
};

const voucherBaseSchema = {
  department: z.string().trim().min(1, 'Department is mandatory'),
  expenseTitle: z.string().trim().min(1, 'Expense Title is mandatory'),
  expenseDate: z.string().min(1, 'Expense Date is mandatory').refine(isNotFutureDate, {
    message: 'Expense date cannot be in the future'
  }),
  expenseCategory: z.enum(EXPENSE_CATEGORIES, {
    errorMap: () => ({ message: `Expense category must be one of: ${EXPENSE_CATEGORIES.join(', ')}` })
  }),
  expenseDescription: z.string().trim().default(''),
  amount: z.union([z.number(), z.string()])
    .transform((val) => (typeof val === 'number' ? val : parseFloat(val)))
    .refine(isValidAmount, {
      message: 'Amount must be greater than zero with at most 2 decimal places'
    }),
  employeeSignaturePath: z.string().nullable().optional()
};

const createVoucherSchema = z.object({
  ...voucherBaseSchema
});

const updateVoucherSchema = z.object({
  ...voucherBaseSchema
});

const rejectVoucherSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(5, 'Rejection reason is mandatory and must be at least 5 characters')
});

module.exports = {
  createVoucherSchema,
  updateVoucherSchema,
  rejectVoucherSchema,
  isNotFutureDate
};
