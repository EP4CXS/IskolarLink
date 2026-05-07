import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Landing } from './pages/public/Landing';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';
import { StudentDashboard } from './pages/student/Dashboard';
import { Scholarships } from './pages/student/Scholarships';
import { Apply } from './pages/student/Apply';
import { Applications } from './pages/student/Applications';
import { ApplicationDetail } from './pages/student/ApplicationDetail';
import { AdminDashboard } from './pages/admin/Dashboard';
import { ManageApplications } from './pages/admin/ManageApplications';
import { ManageScholarships } from './pages/admin/ManageScholarships';
import { ManageGrants } from './pages/admin/ManageGrants';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { Reports } from './pages/admin/Reports';
import { StudentProfile } from './pages/student/Profile';
import { StudentAnnouncements } from './pages/student/Announcements';
export function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
              <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <Navigate to="/student/dashboard" replace />
                  </Layout>
                </ProtectedRoute>
              } />
            
            <Route
              path="/student/dashboard"
              element={
              <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <StudentDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
            
            <Route
              path="/student/scholarships"
              element={
              <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <Scholarships />
                  </Layout>
                </ProtectedRoute>
              } />
            
            <Route
              path="/student/apply/:id"
              element={
              <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <Apply />
                  </Layout>
                </ProtectedRoute>
              } />
            
            <Route
              path="/student/applications"
              element={
              <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <Applications />
                  </Layout>
                </ProtectedRoute>
              } />
            
            <Route
              path="/student/applications/:id"
              element={
              <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <ApplicationDetail />
                  </Layout>
                </ProtectedRoute>
              } />
            
            <Route
              path="/student/profile"
              element={
              <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <StudentProfile />
                  </Layout>
                </ProtectedRoute>
              } />
            
            <Route
              path="/student/announcements"
              element={
              <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <StudentAnnouncements />
                  </Layout>
                </ProtectedRoute>
              } />
            

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
              <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Navigate to="/admin/dashboard" replace />
                  </Layout>
                </ProtectedRoute>
              } />
            
            <Route
              path="/admin/dashboard"
              element={
              <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
            
            <Route
              path="/admin/applications"
              element={
              <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <ManageApplications />
                  </Layout>
                </ProtectedRoute>
              } />
            
            <Route
              path="/admin/scholarships"
              element={
              <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <ManageScholarships />
                  </Layout>
                </ProtectedRoute>
              } />
            
            <Route
              path="/admin/grants"
              element={
              <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <ManageGrants />
                  </Layout>
                </ProtectedRoute>
              } />
            
            <Route
              path="/admin/announcements"
              element={
              <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AdminAnnouncements />
                  </Layout>
                </ProtectedRoute>
              } />
            
            <Route
              path="/admin/reports"
              element={
              <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } />
            

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </DataProvider>);

}