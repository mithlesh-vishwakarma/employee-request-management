import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useRequests } from '../../context/RequestContext';
import { ROLES } from '../../constants';
import { formatRelativeTime } from '../../utils/formatters';
import {
  Menu,
  Bell,
  CheckCheck,
  LogOut,
  Clock,
  Sparkles,
  ChevronDown,
  Shield,
  Briefcase,
  User,
} from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const { currentUser, role, logout, switchDemoRole } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { trigger24hReminder } = useRequests();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Filter notifications for logged-in user or general
  const userNotifs = notifications.filter(
    (n) => !n.recipientId || n.recipientId === currentUser?.id
  );
  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Demo Fast Switcher - allows switching roles without logging out */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase">
            Test Role:
          </span>
          <button
            onClick={() => switchDemoRole(ROLES.ADMIN)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              role === ROLES.ADMIN
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => switchDemoRole(ROLES.MANAGER)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              role === ROLES.MANAGER
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            Manager
          </button>
          <button
            onClick={() => switchDemoRole(ROLES.EMPLOYEE)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              role === ROLES.EMPLOYEE
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            Employee
          </button>
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* 24h Cron Simulation Button */}
        <button
          onClick={trigger24hReminder}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all"
          title="Simulate 24h background reminder cron job"
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Simulate 24h Cron</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 text-xs">
              <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[11px]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead(currentUser?.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {userNotifs.length > 0 ? (
                  userNotifs.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.isRead ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-semibold text-slate-900 leading-snug">
                          {notif.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    <p>No notifications yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="hidden sm:block text-left text-xs leading-tight">
              <span className="font-semibold text-slate-800 block">{currentUser?.name}</span>
              <span className="text-slate-400 text-[11px] capitalize">{currentUser?.department}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  Signed In As
                </span>
                <p className="font-bold text-slate-800 truncate">{currentUser?.name}</p>
                <p className="text-slate-500 text-[11px] truncate">{currentUser?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
