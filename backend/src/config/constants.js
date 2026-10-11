const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  DIRECTOR: 'DIRECTOR',
  ACCOUNTS: 'ACCOUNTS'
};

const VOUCHER_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

const EXPENSE_CATEGORIES = [
  'Travel',
  'Food',
  'Accommodation',
  'Office Supplies',
  'Software',
  'Training',
  'Other'
];

module.exports = {
  ROLES,
  VOUCHER_STATUS,
  EXPENSE_CATEGORIES
};
