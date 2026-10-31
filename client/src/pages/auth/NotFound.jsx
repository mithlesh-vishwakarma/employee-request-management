import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="text-center bg-white p-10 rounded-3xl shadow-xl max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">404 - Page Not Found</h1>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
        The requested URL was not found on this server. Please check your path or return to your dashboard.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
