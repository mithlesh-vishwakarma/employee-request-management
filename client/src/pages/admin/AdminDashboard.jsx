import React, { useState } from 'react';
import { useRequests } from '../../context/RequestContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import RequestDetailsModal from '../../components/forms/RequestDetailsModal';
import EmployeeFormModal from '../../components/forms/EmployeeFormModal';
import { formatDateTime } from '../../utils/formatters';
import { REQUEST_STATUS, ROLES } from '../../constants';
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  UserPlus,
  UserCheck,
  Activity,
  ArrowUpRight,
  Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { requests, users, activityLogs } = useRequests();
  const navigate = useNavigate();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  // Compute metrics dynamically from live state
  const totalEmployees = users.length;
  const activeEmployees = users.filter((u) => u.isActive).length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === REQUEST_STATUS.PENDING).length;
  const approvedRequests = requests.filter((r) => r.status === REQUEST_STATUS.APPROVED).length;
  const rejectedRequests = requests.filter((r) => r.status === REQUEST_STATUS.REJECTED).length;

  const approvalRate =
    totalRequests > 0
      ? Math.round((approvedRequests / (approvedRequests + rejectedRequests || 1)) * 100)
      : 100;

  // Requests by Category
  const categoryCounts = requests.reduce((acc, req) => {
    acc[req.category] = (acc[req.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4" /> Organization Administrator Console
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Executive Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time monitoring of corporate requests, organizational hierarchy assignments, and system audit logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
          <button
            onClick={() => navigate('/admin/manager-assignment')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Managers</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Personnel"
          value={totalEmployees}
          subtitle={`${activeEmployees} active accounts`}
          icon={Users}
          color="indigo"
          onClick={() => navigate('/admin/employees')}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          subtitle="Awaiting manager decisions"
          icon={Clock}
          color="amber"
          onClick={() => navigate('/admin/requests')}
        />
        <StatCard
          title="Approved Requests"
          value={approvedRequests}
          subtitle={`${approvalRate}% approval rate`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Total Requests Logged"
          value={totalRequests}
          subtitle={`${rejectedRequests} rejected`}
          icon={FileText}
          color="blue"
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Pending Queue (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Active Request Pipeline</h3>
              <p className="text-xs text-slate-500">Most recent employee requests across all departments</p>
            </div>
            <button
              onClick={() => navigate('/admin/requests')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">No employee requests submitted yet.</p>
            ) : (
              requests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/70 p-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{req.title}</span>
                      <PriorityBadge priority={req.priority} />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {req.employeeName} • {req.category} • Manager: {req.managerName}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={req.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Categories Breakdown & Quick Stats */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Requests by Category</h3>
            <p className="text-xs text-slate-500">Breakdown of organizational volume</p>
          </div>

          <div className="space-y-3">
            {Object.keys(categoryCounts).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No category data recorded yet.</p>
            ) : (
              Object.entries(categoryCounts).map(([cat, count]) => {
                const percentage = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{cat}</span>
                      <span>
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Activity Logs preview */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600" /> Recent System Audit
              </h4>
              <button
                onClick={() => navigate('/admin/activity-logs')}
                className="text-[11px] text-indigo-600 hover:underline font-semibold"
              >
                Full Logs
              </button>
            </div>
            <div className="space-y-2.5">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No activity recorded yet.</p>
              ) : (
                activityLogs.slice(0, 3).map((act) => (
                  <div key={act.id} className="text-[11px] p-2.5 rounded-lg bg-slate-50 space-y-0.5">
                    <div className="flex items-center justify-between text-slate-800 font-semibold">
                      <span>{act.actorName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {formatDateTime(act.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-1">{act.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RequestDetailsModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />
      <EmployeeFormModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;

