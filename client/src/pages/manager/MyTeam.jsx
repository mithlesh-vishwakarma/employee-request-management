import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import { Mail, Briefcase, FileText, Clock, UserCheck } from 'lucide-react';

const MyTeam = () => {
  const { currentUser } = useAuth();
  const { users, requests } = useRequests();

  const myTeam = users.filter((u) => u.managerId === currentUser?.id && u.isActive);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Supervised Team</h1>
        <p className="text-xs text-slate-500 mt-1">
          Employees currently assigned to report to you for leave, equipment, and administrative request approvals.
        </p>
      </div>

      {/* Grid of Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {myTeam.map((emp) => {
          const empRequests = requests.filter((r) => r.employeeId === emp.id);
          const empPending = empRequests.filter((r) => r.status === 'pending').length;

          return (
            <div
              key={emp.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start gap-3">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{emp.name}</h3>
                  <span className="text-xs text-slate-500 block">{emp.employeeId}</span>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                    {emp.department}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Assigned Direct Report</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="font-bold text-slate-800 text-sm block">
                    {empRequests.length}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">Total Submissions</span>
                </div>
                <div className="bg-amber-50 p-2 rounded-xl">
                  <span className="font-bold text-amber-800 text-sm block">
                    {empPending}
                  </span>
                  <span className="text-[10px] text-amber-600 uppercase">Pending Review</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {myTeam.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm">No employees currently assigned to your team.</p>
        </div>
      )}
    </div>
  );
};

export default MyTeam;

