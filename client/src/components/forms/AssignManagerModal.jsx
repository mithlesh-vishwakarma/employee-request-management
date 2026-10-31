import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { ROLES } from '../../constants';
import { useRequests } from '../../context/RequestContext';
import { UserCheck, Shield } from 'lucide-react';

const AssignManagerModal = ({ isOpen, onClose, employee = null }) => {
  const { users, assignManager } = useRequests();
  const [selectedManagerId, setSelectedManagerId] = useState('');

  const managers = users.filter((u) => u.role === ROLES.MANAGER && u.isActive);

  useEffect(() => {
    if (employee) {
      setSelectedManagerId(employee.managerId || '');
    }
  }, [employee, isOpen]);

  if (!employee) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedManagerId) return;
    assignManager(employee.id, selectedManagerId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Direct Manager" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Employee</span>
          <div className="font-bold text-slate-900 text-sm">{employee.name}</div>
          <div className="text-slate-500">
            {employee.employeeId} • {employee.department}
          </div>
        </div>

        <div>
          <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            Select Manager <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedManagerId}
            onChange={(e) => setSelectedManagerId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
          >
            <option value="">-- Choose an active Manager --</option>
            {managers.map((mgr) => (
              <option key={mgr.id} value={mgr.id}>
                {mgr.name} — {mgr.department}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            All future requests submitted by this employee will be automatically routed to this manager.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedManagerId}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            Save Assignment
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignManagerModal;
