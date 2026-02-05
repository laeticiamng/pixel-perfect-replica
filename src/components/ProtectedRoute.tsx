import { ReactNode, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FullPageLoader } from '@/components/shared/FullPageLoader';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const hasShownToast = useRef(false);

  // Show toast when redirecting unauthenticated user
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error(t('auth.loginRequired'), {
        icon: '🔒',
        duration: 4000,
      });
    }
  }, [isLoading, isAuthenticated, t]);

  if (isLoading) {
    return <FullPageLoader message={t('loading')} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
