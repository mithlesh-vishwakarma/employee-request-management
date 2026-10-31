import React, { useState } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { formatDate, formatDateTime, isOverdue24h } from '../../utils/formatters';
import { useRequests } from '../../context/RequestContext';
import {
  Calendar,
  Clock,
  User,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Send,
} from 'lucide-react';

const RequestDetailsModal = ({ isOpen, onClose, request }) => {
  const [commentInput, setCommentInput] = useState('');
  const { addComment } = useRequests();

  if (!request) return null;

  const isOverdue = isOverdue24h(request.submittedAt, request.status);

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(request.id, commentInput);
    setCommentInput('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Request Details - ${request.id}`} maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Overdue alert if pending > 24h */}
        {isOverdue && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-semibold">Overdue for Review (&gt;24 Hours):</span> This request has been pending decision for more than 24 hours. Automated reminder system dispatched alert to manager.
            </div>
          </div>
        )}

        {/* Title & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              {request.category}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">{request.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={request.priority} />
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Request Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Requester
            </span>
            <span className="font-semibold text-slate-800">{request.employeeName}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5" /> Department
            </span>
            <span className="font-semibold text-slate-800">{request.employeeDepartment}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Assigned Manager
            </span>
            <span className="font-semibold text-slate-800">{request.managerName}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Submitted On
            </span>
            <span className="font-semibold text-slate-800">{formatDate(request.submittedAt)}</span>
          </div>
        </div>

        {/* Date range if applicable */}
        {(request.startDate || request.endDate) && (
          <div className="flex items-center gap-2 text-xs bg-indigo-50/70 border border-indigo-100 text-indigo-800 px-3.5 py-2.5 rounded-lg">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>
              Requested Timeline: <strong>{formatDate(request.startDate)}</strong> to{' '}
              <strong>{formatDate(request.endDate)}</strong>
            </span>
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Description & Justification
          </h4>
          <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-xl p-4 whitespace-pre-wrap leading-relaxed shadow-sm">
            {request.description}
          </p>
        </div>

        {/* Decision / Review Result */}
        {request.status !== 'pending' && (
          <div
            className={`p-4 rounded-xl border ${
              request.status === 'approved'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              {request.status === 'approved' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600" />
              )}
              <span>Decision: {request.status === 'approved' ? 'Approved' : 'Rejected'}</span>
              <span className="text-xs font-normal opacity-75 ml-auto">
                Reviewed {formatDateTime(request.reviewedAt)} by {request.reviewedBy}
              </span>
            </div>
            {request.reviewComment && (
              <p className="text-xs mt-2 pl-7 text-slate-700 italic">
                "{request.reviewComment}"
              </p>
            )}
          </div>
        )}

        {/* Discussion / Comments Section */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            Activity & Comments ({request.comments?.length || 0})
          </h4>

          {/* Comment list */}
          <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
            {request.comments && request.comments.length > 0 ? (
              request.comments.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      {c.authorName} <span className="font-normal text-slate-400">({c.authorRole})</span>
                    </span>
                    <span className="text-slate-400">{formatDateTime(c.createdAt)}</span>
                  </div>
                  <p className="text-slate-600">{c.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No comments posted yet.</p>
            )}
          </div>

          {/* Add comment form */}
          <form onSubmit={handleSendComment} className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add a comment or follow-up note..."
              className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              Post
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RequestDetailsModal;
