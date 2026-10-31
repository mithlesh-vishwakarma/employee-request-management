import React, { useState, useMemo } from 'react';
import { useRequests } from '../../context/RequestContext';
import DataTable from '../../components/common/DataTable';
import DataFilterBar from '../../components/common/DataFilterBar';
import EmployeeFormModal from '../../components/forms/EmployeeFormModal';
import AssignManagerModal from '../../components/forms/AssignManagerModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { DEPARTMENTS, ROLES } from '../../constants';
import {
  UserPlus,
  UserCheck,
  Edit2,
  UserX,
  UserCheck as UserActivate,
  Shield,
  Briefcase,
  Users,
} from 'lucide-react';

const EmployeeList = () => {
  const { users, toggleEmployeeStatus } = useRequests();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [assigningEmployee, setAssigningEmployee] = useState(null);
  const [statusConfirmUser, setStatusConfirmUser] = useState(null);

  // Filtered dataset
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.employeeId && u.employeeId.toLowerCase().includes(search.toLowerCase()));

      const matchRole = selectedRole === 'all' || u.role === selectedRole;
      const matchDept = selectedDept === 'all' || u.department === selectedDept;
      const matchStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && u.isActive) ||
        (selectedStatus === 'inactive' && !u.isActive);

      return matchSearch && matchRole && matchDept && matchStatus;
    });
  }, [users, search, selectedRole, selectedDept, selectedStatus]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedRole('all');
    setSelectedDept('all');
    setSelectedStatus('all');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">
            Admin
          </span>
        );
      case ROLES.MANAGER:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
            Manager
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
            Employee
          </span>
        );
    }
  };

  const columns = [
    {
      header: 'Employee Profile',
      render: (u) => (
        <div className="flex items-center gap-3">
          <img
            src={u.avatar}
            alt={u.name}
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
          <div>
            <span className="font-bold text-slate-900 block text-xs">{u.name}</span>
            <span className="text-[11px] text-slate-400">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Emp ID',
      accessor: 'employeeId',
      cellClassName: 'text-xs font-mono font-medium text-slate-600',
    },
    {
      header: 'Role',
      render: (u) => getRoleBadge(u.role),
    },
    {
      header: 'Department',
      accessor: 'department',
      cellClassName: 'text-xs text-slate-700 font-medium',
    },
    {
      header: 'Direct Manager',
      render: (u) =>
        u.role === ROLES.MANAGER ? (
          <span className="text-[11px] text-slate-400 italic">Self (Manager)</span>
        ) : u.managerName ? (
          <span className="text-xs font-medium text-slate-800">{u.managerName}</span>
        ) : (
          <button
            onClick={() => setAssigningEmployee(u)}
            className="text-[11px] font-semibold text-amber-600 hover:text-amber-800 underline"
          >
            Assign Now
          </button>
        ),
    },
    {
      header: 'Status',
      render: (u) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            u.isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
          />
          {u.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setEditingEmployee(u)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit Employee"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {u.role === ROLES.EMPLOYEE && (
            <button
              onClick={() => setAssigningEmployee(u)}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Assign Manager"
            >
              <UserCheck className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setStatusConfirmUser(u)}
            className={`p-1.5 rounded-lg transition-colors ${
              u.isActive
                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
          >
            {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserActivate className="w-3.5 h-3.5" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personnel Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage corporate employee credentials, department mappings, and supervisor assignments.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee Account</span>
        </button>
      </div>

      {/* Filter Bar */}
      <DataFilterBar
        search={search}
        onSearchChange={setSearch}
        status={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusOptions={[
          { label: 'Active Personnel', value: 'active' },
          { label: 'Deactivated Accounts', value: 'inactive' },
        ]}
        category={selectedDept}
        onCategoryChange={setSelectedDept}
        categoryOptions={DEPARTMENTS}
        onReset={handleResetFilters}
        searchPlaceholder="Search by name, email or employee code..."
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        keyField="id"
        pageSize={6}
        emptyMessage="No personnel records found"
        emptySubtext="Try altering your search keyword or department filters."
      />

      {/* Modals */}
      <EmployeeFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EmployeeFormModal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        employeeToEdit={editingEmployee}
      />

      <AssignManagerModal
        isOpen={!!assigningEmployee}
        onClose={() => setAssigningEmployee(null)}
        employee={assigningEmployee}
      />

      <ConfirmModal
        isOpen={!!statusConfirmUser}
        onClose={() => setStatusConfirmUser(null)}
        onConfirm={() => {
          if (statusConfirmUser) {
            toggleEmployeeStatus(statusConfirmUser.id);
          }
        }}
        title={statusConfirmUser?.isActive ? 'Deactivate Account' : 'Activate Account'}
        message={
          statusConfirmUser?.isActive
            ? `Are you sure you want to deactivate ${statusConfirmUser?.name}'s account? They will lose login access, but historical requests and logs will be retained.`
            : `Are you sure you want to reactivate ${statusConfirmUser?.name}'s corporate account?`
        }
        confirmText={statusConfirmUser?.isActive ? 'Deactivate' : 'Activate'}
        isDestructive={statusConfirmUser?.isActive}
      />
    </div>
  );
};

export default EmployeeList;

