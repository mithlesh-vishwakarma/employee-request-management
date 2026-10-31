import React, { useState } from 'react';
import { useRequests } from '../../context/RequestContext';
import AssignManagerModal from '../../components/forms/AssignManagerModal';
import { ROLES } from '../../constants';
import {
  UserCheck,
  Users,
  ShieldAlert,
  ArrowRight,
  Briefcase,
  Building,
} from 'lucide-react';

const ManagerAssignment = () => {
  const { users } = useRequests();

  const [assigningEmployee, setAssigningEmployee] = useState(null);

  const managers = users.filter((u) => u.role === ROLES.MANAGER && u.isActive);
  const employees = users.filter((u) => u.role === ROLES.EMPLOYEE && u.isActive);

  // Unassigned employees
  const unassignedEmployees = employees.filter((e) => !e.managerId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manager Hierarchy & Assignments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure direct reporting structures. Requests submitted by an employee are automatically routed to their assigned manager.
        </p>
      </div>

      {/* Unassigned Warning Banner */}
      {unassignedEmployees.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                {unassignedEmployees.length} Employee(s) Without Assigned Managers
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Employees without managers cannot submit approval requests until assigned to a supervisor.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {unassignedEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => setAssigningEmployee(emp)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors shadow-xs"
                  >
                    <span>{emp.name}</span>
                    <ArrowRight className="w-3 h-3 text-amber-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Managers & Assigned Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {managers.map((manager) => {
          const directReports = employees.filter((e) => e.managerId === manager.id);

          return (
            <div
              key={manager.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Manager Header Card */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={manager.avatar}
                    alt={manager.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{manager.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                        Manager
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {manager.employeeId} • {manager.department}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-bold text-slate-900 block leading-tight">
                    {directReports.length}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Direct Reports
                  </span>
                </div>
              </div>

              {/* Supervised Members */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Assigned Team Members</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {directReports.length} Active
                  </span>
                </h4>

                {directReports.length > 0 ? (
                  <div className="space-y-2">
                    {directReports.map((emp) => (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-semibold text-slate-800 text-xs block">
                              {emp.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {emp.department} • {emp.email}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setAssigningEmployee(emp)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          Reassign
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400">No employees assigned to this manager yet.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment Modal */}
      <AssignManagerModal
        isOpen={!!assigningEmployee}
        onClose={() => setAssigningEmployee(null)}
        employee={assigningEmployee}
      />
    </div>
  );
};

export default ManagerAssignment;

