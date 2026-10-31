import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import { REQUEST_CATEGORIES, REQUEST_PRIORITY } from '../../constants';
import {
  Send,
  Calendar,
  AlertCircle,
  FileText,
  UserCheck,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const SubmitRequest = () => {
  const { currentUser } = useAuth();
  const { submitRequest } = useRequests();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: REQUEST_CATEGORIES[0],
    priority: REQUEST_PRIORITY.MEDIUM,
    startDate: '',
    endDate: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Request title is required';
    } else if (formData.title.length < 5) {
      errs.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Please provide detailed justification';
    } else if (formData.description.length < 15) {
      errs.description = 'Description should be at least 15 characters';
    }

    if (
      (formData.category === 'Leave' || formData.category === 'Work From Home') &&
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      errs.endDate = 'End date cannot be prior to start date';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    submitRequest(formData);
    navigate('/employee/requests');
  };

  const showDatePickers =
    formData.category === 'Leave' || formData.category === 'Work From Home';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submit New Request</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete the form below to submit a formal request. It will be routed directly to your assigned manager for review.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Routing Notification Banner */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3">
            <UserCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-900 text-xs block">
                Direct Routing to Supervisor
              </span>
              <p className="text-indigo-700 text-[11px] mt-0.5">
                This request will be routed to <strong>{currentUser?.managerName || 'David Vance (Manager)'}</strong>. 
                Our 24-hour reminder scheduler ensures timely feedback.
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Request Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 3-Day Sick Leave or Dual Monitor Setup"
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:bg-white text-xs text-slate-800 ${
                errors.title
                  ? 'border-rose-300 focus:ring-rose-400'
                  : 'border-slate-200 focus:ring-indigo-500'
              }`}
            />
            {errors.title && <p className="text-rose-600 mt-1">{errors.title}</p>}
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs font-medium text-slate-800"
              >
                {REQUEST_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Priority Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(REQUEST_PRIORITY).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`py-2 px-2 rounded-xl text-center font-bold text-[11px] capitalize border transition-all ${
                      formData.priority === p
                        ? p === 'high'
                          ? 'bg-rose-50 border-rose-400 text-rose-700 ring-1 ring-rose-400'
                          : p === 'medium'
                          ? 'bg-blue-50 border-blue-400 text-blue-700 ring-1 ring-blue-400'
                          : 'bg-slate-100 border-slate-300 text-slate-800 ring-1 ring-slate-300'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Conditional Dates (For Leave & WFH) */}
          {showDatePickers && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" /> End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
                {errors.endDate && <p className="text-rose-600 mt-1">{errors.endDate}</p>}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Reason & Detailed Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="State the objective, context, deliverables impact, or financial amount (if reimbursement)..."
              className={`w-full p-4 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:bg-white text-xs text-slate-800 leading-relaxed ${
                errors.description
                  ? 'border-rose-300 focus:ring-rose-400'
                  : 'border-slate-200 focus:ring-indigo-500'
              }`}
            />
            {errors.description && (
              <p className="text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/employee/dashboard')}
              className="px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Submit Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitRequest;

