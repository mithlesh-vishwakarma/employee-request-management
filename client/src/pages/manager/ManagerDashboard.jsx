import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ReviewRequestModal from '../../components/forms/ReviewRequestModal';
import RequestDetailsModal from '../../components/forms/RequestDetailsModal';
import { formatDate, isOverdue24h } from '../../utils/formatters';
import { REQUEST_STATUS, ROLES } from '../../constants';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Eye,
  CheckSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const { currentUser } = useAuth();
  const { requests, users, trigger24hReminder } = useRequests();
  const navigate = useNavigate();

  const [reviewingRequest, setReviewingRequest] = useState(null);
  const [inspectingRequest, setInspectingRequest] = useState(null);

  // Filter requests specifically for this manager's team
  const currentUserId = String(currentUser?._id || currentUser?.id);
  const teamRequests = requests.filter(
    (r) => !r.managerId || String(r.managerId) === currentUserId
  );
  const myTeam = users.filter(
    (u) => String(u.managerId) === currentUserId && u.isActive
  );

  const pendingRequests = teamRequests.filter((r) => r.status === REQUEST_STATUS.PENDING);
  const approvedRequests = teamRequests.filter((r) => r.status === REQUEST_STATUS.APPROVED);
  const rejectedRequests = teamRequests.filter((r) => r.status === REQUEST_STATUS.REJECTED);

  // Overdue pending (>24h)
  const overdueRequests = pendingRequests.filter((r) => isOverdue24h(r.submittedAt, r.status));

  return (
    <div className="space-y-6">
      {/* Overdue Alert Banner if requests > 24 hours */}
      {overdueRequests.length > 0 && (
        <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Action Required: {overdueRequests.length} Overdue Request(s) Pending Review (&gt;24 Hours)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                These team submissions have exceeded the 24-hour SLA. Please review or comment to prevent escalation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setReviewingRequest(overdueRequests[0])}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              Review Next
            </button>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            Manager Review Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Welcome back, {currentUser?.name?.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            You are managing approval workflows for <strong>{myTeam.length}</strong> direct team members in {currentUser?.department}.
          </p>
        </div>

        <button
          onClick={() => navigate('/manager/requests')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all self-start md:self-auto"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Go to Review Queue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Team Direct Reports"
          value={myTeam.length}
          subtitle="Active team members"
          icon={Users}
          color="blue"
          onClick={() => navigate('/manager/team')}
        />
        <StatCard
          title="Pending Approvals"
          value={pendingRequests.length}
          subtitle={`${overdueRequests.length} overdue (>24h)`}
          icon={Clock}
          color={overdueRequests.length > 0 ? 'rose' : 'amber'}
          onClick={() => navigate('/manager/requests')}
        />
        <StatCard
          title="Approved Requests"
          value={approvedRequests.length}
          subtitle="Signed off by you"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Rejected Requests"
          value={rejectedRequests.length}
          subtitle="With written feedback"
          icon={Shield}
          color="indigo"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Action Queue (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pending Team Approvals</h3>
              <p className="text-xs text-slate-500">Requests requiring your review and comment</p>
            </div>
            <button
              onClick={() => navigate('/manager/requests')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>All ({pendingRequests.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {pendingRequests.map((req) => {
                const isOverdue = isOverdue24h(req.submittedAt, req.status);
                return (
                  <div
                    key={req.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{req.title}</span>
                        <PriorityBadge priority={req.priority} />
                        {isOverdue && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            &gt;24h Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{req.description}</p>
                      <div className="text-[11px] text-slate-400">
                        {req.employeeName} • {req.category} • Submitted {formatDate(req.submittedAt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setInspectingRequest(req)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setReviewingRequest(req)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-slate-800">Inbox Clean!</h4>
              <p className="text-xs text-slate-400 mt-1">
                You have reviewed all submitted requests from your team.
              </p>
            </div>
          )}
        </div>

        {/* My Team Members Glance (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Supervised Team</h3>
              <p className="text-xs text-slate-500">Your direct reports</p>
            </div>
            <button
              onClick={() => navigate('/manager/team')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {myTeam.map((emp) => {
              const empPending = pendingRequests.filter((r) => r.employeeId === emp.id).length;
              return (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{emp.name}</span>
                      <span className="text-[10px] text-slate-400">{emp.employeeId}</span>
                    </div>
                  </div>

                  {empPending > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {empPending} pending
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Clear</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewRequestModal
        isOpen={!!reviewingRequest}
        onClose={() => setReviewingRequest(null)}
        request={reviewingRequest}
      />

      {/* Details Modal */}
      <RequestDetailsModal
        isOpen={!!inspectingRequest}
        onClose={() => setInspectingRequest(null)}
        request={inspectingRequest}
      />
    </div>
  );
};

export default ManagerDashboard;

