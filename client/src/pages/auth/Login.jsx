import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS, ROLES } from '../../constants';
import { Layers, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@enterprise.com');
  const [password, setPassword] = useState('password123');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const result = login(email, password);
    if (result.success) {
      redirectToRoleDashboard(result.user.role);
    }
  };

  const handleQuickLogin = (demoUser) => {
    setEmail(demoUser.email);
    setPassword('password123');
    const result = login(demoUser.email, 'password123');
    if (result.success) {
      redirectToRoleDashboard(result.user.role);
    }
  };

  const redirectToRoleDashboard = (role) => {
    if (role === ROLES.ADMIN) navigate('/admin/dashboard');
    else if (role === ROLES.MANAGER) navigate('/manager/dashboard');
    else navigate('/employee/dashboard');
  };

  return (
    <div className="w-full">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-brand-400 text-white shadow-xl shadow-indigo-500/20 mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Nexus ERM Portal</h2>
        <p className="mt-1 text-xs text-slate-400">
          Employee Request Management & Automated Approval Workflow System
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100">
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
                placeholder="name@enterprise.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
            Quick 1-Click Demo Logins
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin(DEMO_USERS[0])}
              className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-center transition-all group"
            >
              <span className="block text-[11px] font-bold text-purple-700">Admin</span>
              <span className="block text-[9px] text-purple-500 truncate">Full System</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin(DEMO_USERS[1])}
              className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-center transition-all group"
            >
              <span className="block text-[11px] font-bold text-blue-700">Manager</span>
              <span className="block text-[9px] text-blue-500 truncate">Team Approvals</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin(DEMO_USERS[3])}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-center transition-all group"
            >
              <span className="block text-[11px] font-bold text-emerald-700">Employee</span>
              <span className="block text-[9px] text-emerald-500 truncate">Submit & Track</span>
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Enterprise JWT & Role-Based Access Control</span>
      </p>
    </div>
  );
};

export default Login;

