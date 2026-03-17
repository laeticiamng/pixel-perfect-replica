import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { FullPageLoader } from '@/components/shared/FullPageLoader';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRole: 'admin';
}

export function RoleProtectedRoute({ children, requiredRole }: RoleProtectedRouteProps) {
  const { isAdmin, isLoading } = useAdminCheck();

  // First ensure user is authenticated
  return (
    <ProtectedRoute>
      <RoleGate requiredRole={requiredRole} isAdmin={isAdmin} isLoading={isLoading}>
        {children}
      </RoleGate>
    </ProtectedRoute>
  );
}

function RoleGate({ children, requiredRole, isAdmin, isLoading }: {
  children: ReactNode;
  requiredRole: 'admin';
  isAdmin: boolean;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <FullPageLoader />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
