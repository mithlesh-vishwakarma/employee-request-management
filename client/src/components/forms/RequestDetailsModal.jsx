import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { formatDate, formatDateTime, isOverdue24h } from '../../utils/formatters';
import { useRequests } from '../../context/RequestContext';
import { getCommentsApi } from '../../services/requestApi';
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
  Loader2,
} from 'lucide-react';

const RequestDetailsModal = ({ isOpen, onClose, request }) => {
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const { addComment } = useRequests();

  const reqId = request?._id || request?.id;

  // Fetch comments when modal opens
  useEffect(() => {
    if (!isOpen || !reqId) {
      setComments([]);
      return;
    }

    let isMounted = true;
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const res = await getCommentsApi(reqId);
        if (isMounted && res?.data) {
          setComments(res.data);
        }
      } catch (err) {
        console.warn('Failed to load comments:', err.message);
      } finally {
        if (isMounted) setLoadingComments(false);
      }
    };

    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [isOpen, reqId]);

  if (!request) return null;

  const isOverdue = isOverdue24h(request.submittedAt, request.status);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      await addComment(reqId, commentInput);
      setCommentInput('');
      // Reload comments
      const res = await getCommentsApi(reqId);
      if (res?.data) {
        setComments(res.data);
      }
    } catch (err) {
      // handled in context
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Details" maxWidth="max-w-2xl">
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
            Activity & Comments ({comments.length})
          </h4>

          {/* Comment list */}
          <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
            {loadingComments ? (
              <div className="py-6 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Loading discussion thread...</span>
              </div>
            ) : comments.length > 0 ? (
              comments.map((c) => {
                const author = c.authorId?.name || c.authorName || 'User';
                const role = c.authorId?.role || c.authorRole || 'member';
                return (
                  <div key={c._id || c.id} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {author} <span className="font-normal text-slate-400">({role})</span>
                      </span>
                      <span className="text-slate-400">{formatDateTime(c.createdAt)}</span>
                    </div>
                    <p className="text-slate-600">{c.message}</p>
                  </div>
                );
              })
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
              disabled={!commentInput.trim() || submittingComment}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              {submittingComment ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Post</span>
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
