import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';

const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  pageSize = 5,
  emptyMessage = 'No records found',
  emptySubtext = 'Try adjusting your filters or search terms.',
  emptyAction,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (!data || data.length === 0) {
    return <EmptyState title={emptyMessage} description={emptySubtext} action={emptyAction} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3.5 ${col.align === 'right' ? 'text-right' : 'text-left'} ${
                    col.className || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentData.map((item, rowIdx) => (
              <tr
                key={item[keyField] || rowIdx}
                className="hover:bg-slate-50/60 transition-colors duration-150"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-6 py-4 align-middle ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(item, rowIdx) : item[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {data.length > pageSize && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(startIndex + pageSize, data.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{data.length}</span> results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={validPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              Page {validPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={validPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
