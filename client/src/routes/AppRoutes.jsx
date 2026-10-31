import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants';

// Layouts
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

// Pages - Auth
import Login from '../pages/auth/Login';
import Unauthorized from '../pages/auth/Unauthorized';
import NotFound from '../pages/auth/NotFound';

// Pages - Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import EmployeeList from '../pages/admin/EmployeeList';
import ManagerAssignment from '../pages/admin/ManagerAssignment';
import AllRequests from '../pages/admin/AllRequests';
import ActivityLogs from '../pages/admin/ActivityLogs';

// Pages - Manager
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import TeamRequests from '../pages/manager/TeamRequests';
import MyTeam from '../pages/manager/MyTeam';

// Pages - Employee
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import SubmitRequest from '../pages/employee/SubmitRequest';
import MyRequests from '../pages/employee/MyRequests';

const RootRedirect = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
  if (role === ROLES.MANAGER) return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<EmployeeList />} />
          <Route path="/admin/manager-assignment" element={<ManagerAssignment />} />
          <Route path="/admin/requests" element={<AllRequests />} />
          <Route path="/admin/activity-logs" element={<ActivityLogs />} />
        </Route>
      </Route>

      {/* Manager Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER]} />}>
        <Route element={<AppLayout />}>
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/requests" element={<TeamRequests />} />
          <Route path="/manager/team" element={<MyTeam />} />
        </Route>
      </Route>

      {/* Employee Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE]} />}>
        <Route element={<AppLayout />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/submit" element={<SubmitRequest />} />
          <Route path="/employee/requests" element={<MyRequests />} />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
