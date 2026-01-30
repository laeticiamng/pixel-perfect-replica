import { forwardRef } from 'react';
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export const OfflineBanner = forwardRef<HTMLDivElement, Record<string, never>>(
  function OfflineBanner(_, ref) {
  const { isOnline } = useNetworkStatus();
  const { t } = useTranslation();

  if (isOnline) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground",
          "px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium",
          "animate-slide-down safe-top"
        )}
      >
        <WifiOff className="h-4 w-4" />
        <span>{t('errors.noConnection')}</span>
      </div>
    );
  }
);

OfflineBanner.displayName = 'OfflineBanner';
