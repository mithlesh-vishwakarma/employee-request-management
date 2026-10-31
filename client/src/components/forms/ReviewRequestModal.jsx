import React, { useState } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { formatDate, isOverdue24h } from '../../utils/formatters';
import { useRequests } from '../../context/RequestContext';
import { REQUEST_STATUS } from '../../constants';
import { Check, X, AlertTriangle, MessageSquare } from 'lucide-react';

const ReviewRequestModal = ({ isOpen, onClose, request }) => {
  const [decision, setDecision] = useState('approve'); // 'approve' | 'reject'
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const { reviewRequest } = useRequests();

  if (!request) return null;

  const isOverdue = isOverdue24h(request.submittedAt, request.status);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // If rejection, comment is mandatory according to system requirements
    if (decision === 'reject' && !comment.trim()) {
      setError('A comment explaining the rejection reason is strictly required.');
      return;
    }

    const success = reviewRequest(request.id, {
      status: decision === 'approve' ? REQUEST_STATUS.APPROVED : REQUEST_STATUS.REJECTED,
      comment: comment.trim(),
    });

    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Request" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Overdue alert banner */}
        {isOverdue && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <strong>Action Needed:</strong> This request has exceeded the 24-hour review SLA.
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500 uppercase">{request.id}</span>
            <PriorityBadge priority={request.priority} />
          </div>
          <h4 className="text-sm font-bold text-slate-900">{request.title}</h4>
          <p className="text-slate-600 line-clamp-2">{request.description}</p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-slate-500">
            <span>By: <strong>{request.employeeName}</strong> ({request.employeeDepartment})</span>
            <span>Submitted: {formatDate(request.submittedAt)}</span>
          </div>
        </div>

        {/* Decision Toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Your Decision <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setDecision('approve');
                setError('');
              }}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${decision === 'approve'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-500'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Check className="w-4 h-4 text-emerald-600" />
              Approve Request
            </button>

            <button
              type="button"
              onClick={() => {
                setDecision('reject');
                setError('');
              }}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${decision === 'reject'
                ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-sm ring-1 ring-rose-500'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
              <X className="w-4 h-4 text-rose-600" />
              Reject Request
            </button>
          </div>
        </div>

        {/* Comment field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Manager Review Notes
            </span>
            <span className={`text-[11px] font-normal ${decision === 'reject' ? 'text-rose-600 font-semibold' : 'text-slate-400'}`}>
              {decision === 'reject' ? 'Mandatory for Rejections *' : 'Optional for Approvals'}
            </span>
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (error) setError('');
            }}
            placeholder={
              decision === 'reject'
                ? 'State the reason for rejecting this request (required)...'
                : 'Add optional feedback or approval remarks...'
            }
            className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${error
              ? 'border-rose-300 focus:ring-rose-400'
              : 'border-slate-200 focus:ring-indigo-500'
              }`}
          />
          {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm ${decision === 'approve'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-rose-600 hover:bg-rose-700'
              }`}
          >
            Confirm {decision === 'approve' ? 'Approval' : 'Rejection'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewRequestModal;
