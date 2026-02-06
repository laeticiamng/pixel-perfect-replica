import { useState, useEffect, useRef } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface ExpirationTimerProps {
  expiresAt: string | Date;
  className?: string;
  onExpire?: () => void;
  onExtend?: () => void;
  canExtend?: boolean;
}

export function ExpirationTimer({ 
  expiresAt, className, onExpire, onExtend, canExtend = false 
}: ExpirationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const hasExpiredRef = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    hasExpiredRef.current = false;
  }, [expiresAt]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiry = new Date(expiresAt).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft(t('timer.expired'));
        if (!hasExpiredRef.current) {
          hasExpiredRef.current = true;
          onExpire?.();
        }
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const urgent = diff < 15 * 60 * 1000;
      setIsUrgent(urgent);
      setShowExtend(canExtend && diff < 30 * 60 * 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes.toString().padStart(2, '0')}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire, canExtend, t]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
          isUrgent 
            ? 'bg-signal-red/20 text-signal-red animate-pulse' 
            : 'bg-muted text-muted-foreground'
        )}
      >
        <Clock className="h-3 w-3" />
        <span>{timeLeft}</span>
      </div>
      
      {showExtend && onExtend && (
        <button
          onClick={onExtend}
          className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-coral/20 text-coral hover:bg-coral/30 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          <span>{t('timer.extend')}</span>
        </button>
      )}
    </div>
  );
}