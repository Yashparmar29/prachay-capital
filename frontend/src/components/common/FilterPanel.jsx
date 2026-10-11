import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ArrowUpDown, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'Travel',
  'Food',
  'Accommodation',
  'Office Supplies',
  'Software',
  'Training',
  'Other'
];

const STATUSES = ['DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'];

export const FilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  showStatusFilter = true,
  showEmployeeFilter = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [isOpen, setIsOpen] = useState(false);

  // Debounce search input by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        onFilterChange({ search: searchTerm, page: 1 });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.department ||
    filters.category ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.minAmount ||
    filters.maxAmount ||
    (filters.employeeName && showEmployeeFilter);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-6">
      {/* Search and toggle bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input with debouncing */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              showEmployeeFilter
                ? 'Search by voucher #, title, or employee...'
                : 'Search by voucher # or expense title...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          {/* Sort By */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
            <select
              value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                onFilterChange({ sortBy, sortOrder, page: 1 });
              }}
              className="pl-8 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="expenseDate-desc">Expense Date (Recent)</option>
              <option value="expenseDate-asc">Expense Date (Older)</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
              <option value="voucherNumber-desc">Voucher Number (Desc)</option>
              <option value="voucherNumber-asc">Voucher Number (Asc)</option>
            </select>
          </div>

          {/* Toggle filter dropdown */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isOpen || hasActiveFilters
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            )}
          </button>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchTerm('');
                onClearFilters();
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-100 transition-colors"
              title="Clear all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable filter grid */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Status Filter */}
          {showStatusFilter && (
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Filter */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Category</label>
            <select
              value={filters.category || ''}
              onChange={(e) => onFilterChange({ category: e.target.value, page: 1 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Department</label>
            <input
              type="text"
              placeholder="e.g. Engineering"
              value={filters.department || ''}
              onChange={(e) => onFilterChange({ department: e.target.value, page: 1 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Employee Name (if allowed) */}
          {showEmployeeFilter && (
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Employee Name</label>
              <input
                type="text"
                placeholder="e.g. Aarav Gupta"
                value={filters.employeeName || ''}
                onChange={(e) => onFilterChange({ employeeName: e.target.value, page: 1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Date From */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Expense Date From</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFilterChange({ dateFrom: e.target.value, page: 1 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Expense Date To</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFilterChange({ dateTo: e.target.value, page: 1 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Min Amount */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Min Amount (₹)</label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              value={filters.minAmount || ''}
              onChange={(e) => onFilterChange({ minAmount: e.target.value, page: 1 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Max Amount (₹)</label>
            <input
              type="number"
              placeholder="100000"
              min="0"
              value={filters.maxAmount || ''}
              onChange={(e) => onFilterChange({ maxAmount: e.target.value, page: 1 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
