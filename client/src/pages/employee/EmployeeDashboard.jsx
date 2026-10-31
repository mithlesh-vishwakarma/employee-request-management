import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import RequestDetailsModal from '../../components/forms/RequestDetailsModal';
import { formatDate } from '../../utils/formatters';
import { REQUEST_STATUS } from '../../constants';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowRight,
  UserCheck,
  Eye,
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { currentUser } = useAuth();
  const { requests } = useRequests();
  const navigate = useNavigate();

  const [selectedRequest, setSelectedRequest] = useState(null);

  // Filter requests submitted by this employee
  const myId = String(currentUser?._id || currentUser?.id);
  const myRequests = requests.filter((r) => !r.employeeId || String(r.employeeId) === myId);

  const pendingRequests = myRequests.filter((r) => r.status === REQUEST_STATUS.PENDING);
  const approvedRequests = myRequests.filter((r) => r.status === REQUEST_STATUS.APPROVED);
  const rejectedRequests = myRequests.filter((r) => r.status === REQUEST_STATUS.REJECTED);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Employee Self-Service Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Welcome, {currentUser?.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Assigned Direct Manager: <strong>{currentUser?.managerId?.name || currentUser?.managerName || 'Assigned Direct Manager'}</strong>
            </span>
          </p>
        </div>

        <button
          onClick={() => navigate('/employee/submit')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Submissions"
          value={myRequests.length}
          subtitle="All-time requests"
          icon={FileText}
          color="indigo"
          onClick={() => navigate('/employee/requests')}
        />
        <StatCard
          title="Pending Decisions"
          value={pendingRequests.length}
          subtitle="Currently with manager"
          icon={Clock}
          color="amber"
          onClick={() => navigate('/employee/requests')}
        />
        <StatCard
          title="Approved Requests"
          value={approvedRequests.length}
          subtitle="Approved requests"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Rejected Requests"
          value={rejectedRequests.length}
          subtitle="With manager comments"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Recent Submissions List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">My Recent Requests</h3>
            <p className="text-xs text-slate-500">Track current status and supervisor review remarks</p>
          </div>
          <button
            onClick={() => navigate('/employee/requests')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>All Requests ({myRequests.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myRequests.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {myRequests.slice(0, 5).map((req, idx) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <span className="font-bold text-xs text-slate-900">{req.title}</span>
                    <PriorityBadge priority={req.priority} />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {req.category} • Submitted {formatDate(req.submittedAt)} • Manager: {req.managerName}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={req.status} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRequest(req);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No requests submitted yet</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Submit your first leave, reimbursement, or equipment request to get started.
            </p>
            <button
              onClick={() => navigate('/employee/submit')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              Submit New Request
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <RequestDetailsModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />
    </div>
  );
};

export default EmployeeDashboard;

