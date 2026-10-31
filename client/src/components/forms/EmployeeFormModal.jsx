import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { DEPARTMENTS, ROLES } from '../../constants';
import { useRequests } from '../../context/RequestContext';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';

const EmployeeFormModal = ({ isOpen, onClose, employeeToEdit = null }) => {
  const { users, addEmployee, updateEmployee } = useRequests();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.EMPLOYEE,
    department: DEPARTMENTS[0],
    managerId: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const managers = users.filter((u) => u.role === ROLES.MANAGER && u.isActive);

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        name: employeeToEdit.name || '',
        email: employeeToEdit.email || '',
        password: '',
        role: employeeToEdit.role || ROLES.EMPLOYEE,
        department: employeeToEdit.department || DEPARTMENTS[0],
        managerId: employeeToEdit.managerId || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: 'Password123!',
        role: ROLES.EMPLOYEE,
        department: DEPARTMENTS[0],
        managerId: managers[0]?.id || '',
      });
    }
    setShowPassword(false);
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

    if (!employeeToEdit && !formData.password.trim()) {
      errs.password = 'Initial password is required';
    } else if (formData.password && formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (formData.role === ROLES.EMPLOYEE && !formData.managerId) {
      errs.managerId = 'Assigning a direct manager is recommended for employees';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (employeeToEdit) {
        const payload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          managerId: formData.role === ROLES.MANAGER ? null : formData.managerId || null,
        };
        if (formData.password && formData.password.trim()) {
          payload.password = formData.password.trim();
        }
        await updateEmployee(employeeToEdit.id || employeeToEdit._id, payload);
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password || 'Password123!',
          role: formData.role,
          department: formData.department,
          managerId: formData.role === ROLES.MANAGER ? null : formData.managerId || null,
        };
        await addEmployee(payload);
      }
      onClose();
    } catch (err) {
      // error handled in context
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employeeToEdit ? 'Edit Account Details' : 'Create New Personnel Account'}
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

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>{employeeToEdit ? 'Reset Password (Optional)' : 'Account Password'}</span>
              {!employeeToEdit && <span className="text-rose-500">*</span>}
            </label>
            <span className="text-[10px] text-slate-400">Min 6 characters</span>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={employeeToEdit ? 'Leave blank to retain current password' : 'Enter account password'}
              className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 text-xs ${
                errors.password
                  ? 'border-rose-300 focus:ring-rose-400'
                  : 'border-slate-200 focus:ring-indigo-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="text-rose-600 mt-1">{errors.password}</p>
          ) : (
            <p className="text-[10px] text-slate-400 mt-1">
              {employeeToEdit
                ? 'Only fill this if you want to update the user’s login password.'
                : 'The employee or manager will use this password to sign in.'}
            </p>
          )}
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

