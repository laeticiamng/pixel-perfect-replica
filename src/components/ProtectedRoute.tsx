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

  // Reset toast flag when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      hasShownToast.current = false;
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <FullPageLoader message={t('loading')} />;
  }

  if (!isAuthenticated) {
    // Redirect to onboarding with login state and return path
    return <Navigate to="/onboarding" state={{ isLogin: true, from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
