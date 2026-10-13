import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}
export function ProtectedRoute({
  children,
  allowedRoles
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>);

  }
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location
        }}
        replace />);


  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard if wrong role
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  return <>{children}</>;
}