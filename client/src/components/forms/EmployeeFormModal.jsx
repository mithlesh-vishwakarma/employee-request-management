import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { DEPARTMENTS, ROLES } from '../../constants';
import { useRequests } from '../../context/RequestContext';

const EmployeeFormModal = ({ isOpen, onClose, employeeToEdit = null }) => {
  const { users, addEmployee, updateEmployee } = useRequests();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ROLES.EMPLOYEE,
    department: DEPARTMENTS[0],
    managerId: '',
  });

  const [errors, setErrors] = useState({});

  const managers = users.filter((u) => u.role === ROLES.MANAGER && u.isActive);

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        name: employeeToEdit.name || '',
        email: employeeToEdit.email || '',
        role: employeeToEdit.role || ROLES.EMPLOYEE,
        department: employeeToEdit.department || DEPARTMENTS[0],
        managerId: employeeToEdit.managerId || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: ROLES.EMPLOYEE,
        department: DEPARTMENTS[0],
        managerId: managers[0]?.id || '',
      });
    }
    setErrors({});
  }, [employeeToEdit, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (formData.role === ROLES.EMPLOYEE && !formData.managerId) {
      errs.managerId = 'Assigning a direct manager is recommended for employees';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (employeeToEdit) {
      updateEmployee(employeeToEdit.id, formData);
    } else {
      addEmployee(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employeeToEdit ? 'Edit Account Details' : 'Create New Employee Account'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Name */}
        <div>
          <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Rachel Adams"
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
              errors.name ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-indigo-500'
            }`}
          />
          {errors.name && <p className="text-rose-600 mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Corporate Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="rachel.adams@enterprise.com"
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
              errors.email ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-indigo-500'
            }`}
          />
          {errors.email && <p className="text-rose-600 mt-1">{errors.email}</p>}
        </div>

        {/* Role & Department */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value,
                  managerId: e.target.value === ROLES.MANAGER ? '' : formData.managerId,
                })
              }
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={ROLES.EMPLOYEE}>Employee</option>
              <option value={ROLES.MANAGER}>Manager</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Department
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assigned Manager (Only for Employee role) */}
        {formData.role === ROLES.EMPLOYEE && (
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Assigned Direct Manager
            </label>
            <select
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a Manager...</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.department})
                </option>
              ))}
            </select>
            {errors.managerId && <p className="text-amber-600 mt-1">{errors.managerId}</p>}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            {employeeToEdit ? 'Save Changes' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeFormModal;
