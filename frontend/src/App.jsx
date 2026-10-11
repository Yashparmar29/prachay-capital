import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Auth & Error Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForbiddenPage } from './pages/errors/ForbiddenPage';
import { NotFoundPage } from './pages/errors/NotFoundPage';
import { DemoCompletePage } from './pages/common/DemoCompletePage';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { MyVouchersPage } from './pages/employee/MyVouchersPage';
import { VoucherCreatePage } from './pages/employee/VoucherCreatePage';
import { VoucherEditPage } from './pages/employee/VoucherEditPage';
import { VoucherDetailsPage } from './pages/employee/VoucherDetailsPage';
import { EmployeeSignaturePage } from './pages/employee/EmployeeSignaturePage';

// Director Pages
import { DirectorDashboard } from './pages/director/DirectorDashboard';
import { PendingApprovalsPage } from './pages/director/PendingApprovalsPage';
import { AllVouchersPage } from './pages/director/AllVouchersPage';
import { DirectorVoucherDetailsPage } from './pages/director/DirectorVoucherDetailsPage';

// Accounts Pages
import { AccountsDashboard } from './pages/accounts/AccountsDashboard';
import { AccountsAllVouchersPage } from './pages/accounts/AccountsAllVouchersPage';
import { AccountsVoucherDetailsPage } from './pages/accounts/AccountsVoucherDetailsPage';

export function App() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Prachay Capital Portal...</p>
        </div>
      </div>
    );
  }

  // Root redirect based on role
  const getHomeRedirect = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'DIRECTOR') return '/director/dashboard';
    if (user?.role === 'ACCOUNTS') return '/accounts/dashboard';
    return '/employee/dashboard';
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />

      {/* Public Auth Route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getHomeRedirect()} replace /> : <LoginPage />}
      />

      {/* Employee Routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="vouchers" element={<MyVouchersPage />} />
        <Route path="vouchers/create" element={<VoucherCreatePage />} />
        <Route path="vouchers/:id" element={<VoucherDetailsPage />} />
        <Route path="vouchers/:id/edit" element={<VoucherEditPage />} />
        <Route path="signature" element={<EmployeeSignaturePage />} />
      </Route>

      {/* Director Routes */}
      <Route
        path="/director"
        element={
          <ProtectedRoute allowedRoles={['DIRECTOR']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/director/dashboard" replace />} />
        <Route path="dashboard" element={<DirectorDashboard />} />
        <Route path="pending" element={<PendingApprovalsPage />} />
        <Route path="vouchers" element={<AllVouchersPage />} />
        <Route path="vouchers/:id" element={<DirectorVoucherDetailsPage />} />
      </Route>

      {/* Accounts Routes */}
      <Route
        path="/accounts"
        element={
          <ProtectedRoute allowedRoles={['ACCOUNTS']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/accounts/dashboard" replace />} />
        <Route path="dashboard" element={<AccountsDashboard />} />
        <Route path="vouchers" element={<AccountsAllVouchersPage />} />
        <Route path="vouchers/:id" element={<AccountsVoucherDetailsPage />} />
      </Route>

      {/* Demo Complete Route */}
      <Route path="/demo-complete" element={<DemoCompletePage />} />

      {/* Error Routes */}
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
