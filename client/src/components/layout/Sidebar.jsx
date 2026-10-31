import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Activity,
  PlusCircle,
  Inbox,
  CheckSquare,
  ShieldCheck,
  Layers,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { role, isAdmin, isManager, isEmployee } = useAuth();
  const location = useLocation();

  // Navigation configurations based on role
  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { label: 'Admin Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Employees', to: '/admin/employees', icon: Users },
        { label: 'Manager Assign', to: '/admin/manager-assignment', icon: UserCheck },
        { label: 'All Requests', to: '/admin/requests', icon: FileText },
        { label: 'Activity Logs', to: '/admin/activity-logs', icon: Activity },
      ];
    }
    if (isManager) {
      return [
        { label: 'Manager Dashboard', to: '/manager/dashboard', icon: LayoutDashboard },
        { label: 'Team Requests', to: '/manager/requests', icon: CheckSquare },
        { label: 'My Team', to: '/manager/team', icon: Users },
      ];
    }
    // Employee
    return [
      { label: 'Employee Dashboard', to: '/employee/dashboard', icon: LayoutDashboard },
      { label: 'Submit Request', to: '/employee/submit', icon: PlusCircle },
      { label: 'My Requests', to: '/employee/requests', icon: Inbox },
    ];
  };

  const navLinks = getNavLinks();

  const getRoleBadge = () => {
    switch (role) {
      case ROLES.ADMIN:
        return { label: 'Administrator', bg: 'bg-purple-100 text-purple-700' };
      case ROLES.MANAGER:
        return { label: 'Team Manager', bg: 'bg-blue-100 text-blue-700' };
      default:
        return { label: 'Employee', bg: 'bg-emerald-100 text-emerald-700' };
    }
  };

  const badge = getRoleBadge();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-brand-400 flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-tight">
                Nexus<span className="text-indigo-400">ERM</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Enterprise Portal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Role Banner */}
        <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Access Role
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg}`}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Security / System Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/30 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px]">RBAC Policy Enforced</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            MERN Request Flow Engine v1.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

