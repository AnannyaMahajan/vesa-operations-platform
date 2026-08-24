import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateRequestPage from './pages/CreateRequestPage';
import RequestListPage from './pages/RequestListPage';
import PendingWorkPage from './pages/PendingWorkPage';
import RequestDetailPage from './pages/RequestDetailPage';
import AdminPage from './pages/AdminPage';
import AuditLogPage from './pages/AuditLogPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './styles/index.css';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading application...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />

            <Route path="/requests" element={
              <ProtectedRoute>
                <RequestListPage />
              </ProtectedRoute>
            } />

            <Route path="/pending-work" element={
              <ProtectedRoute>
                <PendingWorkPage />
              </ProtectedRoute>
            } />

            <Route path="/requests/create" element={
              <ProtectedRoute>
                <CreateRequestPage />
              </ProtectedRoute>
            } />

            <Route path="/requests/:id" element={
              <ProtectedRoute>
                <RequestDetailPage />
              </ProtectedRoute>
            } />

            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['Operations Manager', 'System Administrator']}>
                <AnalyticsPage />
              </ProtectedRoute>
            } />

            <Route path="/audit-logs" element={
              <ProtectedRoute allowedRoles={['Operations Manager', 'System Administrator']}>
                <AuditLogPage />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['System Administrator']}>
                <AdminPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
