import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants';
import { Layers, ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, Loader2, KeyRound } from 'lucide-react';

const SEEDED_CREDENTIALS = [
  { role: 'Admin', email: 'admin@enterprise.com', label: 'Full System Control' },
  { role: 'Manager', email: 'manager@enterprise.com', label: 'Team Approvals' },
  { role: 'Employee', email: 'employee@enterprise.com', label: 'Submit & Track' },
];

const Login = () => {
  const [email, setEmail] = useState('admin@enterprise.com');
  const [password, setPassword] = useState('Password123!');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const result = await login(email, password);
      if (result?.success) {
        redirectToRoleDashboard(result.user.role);
      } else {
        setErrorMessage(result?.error || 'Invalid email or password');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillAndLogin = async (credEmail) => {
    setEmail(credEmail);
    setPassword('Password123!');
    setErrorMessage('');
    setSubmitting(true);

    try {
      const result = await login(credEmail, 'Password123!');
      if (result?.success) {
        redirectToRoleDashboard(result.user.role);
      } else {
        setErrorMessage(result?.error || 'Login failed');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Connection error');
    } finally {
      setSubmitting(false);
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
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

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
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Atlas...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Database Seeded Accounts Quick-Fill */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
              Atlas Database Demo Logins
            </span>
            <span className="text-[10px] text-slate-400 font-mono">pwd: Password123!</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {SEEDED_CREDENTIALS.map((cred) => (
              <button
                key={cred.role}
                type="button"
                disabled={submitting}
                onClick={() => fillAndLogin(cred.email)}
                className="p-2.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl text-center transition-all group disabled:opacity-50"
              >
                <span className="block text-[11px] font-bold text-slate-800 group-hover:text-indigo-600">
                  {cred.role}
                </span>
                <span className="block text-[9px] text-slate-500 truncate">{cred.label}</span>
              </button>
            ))}
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

