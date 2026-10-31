import React from 'react';

const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  if (type === 'table') {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
        <div className="h-12 bg-slate-100 border-b border-slate-200" />
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-16 border-b border-slate-100 flex items-center px-6 gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
            <div className="w-20 h-6 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 bg-white rounded-xl border border-slate-200 space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-200" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-7 bg-slate-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
