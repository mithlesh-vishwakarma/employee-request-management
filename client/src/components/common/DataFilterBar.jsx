import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

const DataFilterBar = ({
  search = '',
  onSearchChange,
  status = 'all',
  onStatusChange,
  statusOptions = [],
  category = 'all',
  onCategoryChange,
  categoryOptions = [],
  priority = 'all',
  onPriorityChange,
  priorityOptions = [],
  onReset,
  searchPlaceholder = 'Search by title, employee or ID...',
}) => {
  const hasActiveFilters =
    search ||
    (status && status !== 'all') ||
    (category && category !== 'all') ||
    (priority && priority !== 'all');

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3 mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Dropdown filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {statusOptions.length > 0 && onStatusChange && (
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {categoryOptions.length > 0 && onCategoryChange && (
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {priorityOptions.length > 0 && onPriorityChange && (
            <select
              value={priority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="all">All Priorities</option>
              {priorityOptions.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)} Priority
                </option>
              ))}
            </select>
          )}

          {hasActiveFilters && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataFilterBar;
