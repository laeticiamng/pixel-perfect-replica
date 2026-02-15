import { useState, useRef } from 'react';
import { AlertTriangle, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useTranslation } from '@/lib/i18n';
import { logger } from '@/lib/logger';

interface EmergencyButtonProps {
  onTrigger?: (position: GeolocationPosition | null) => void;
  className?: string;
}

export function EmergencyButton({ onTrigger, className }: EmergencyButtonProps) {
  const { t } = useTranslation();
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const HOLD_DURATION = 2000;

  const startHold = () => {
    setIsHolding(true);
    setHoldProgress(0);
    let progress = 0;
    progressRef.current = setInterval(() => {
      progress += 5;
      setHoldProgress(Math.min(progress, 100));
    }, HOLD_DURATION / 20);
    holdTimerRef.current = setTimeout(() => {
      triggerEmergency();
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
    if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
  };

  const triggerEmergency = async () => {
    cancelHold();
    if ('vibrate' in navigator) { navigator.vibrate([200, 100, 200, 100, 400]); }
    let position: GeolocationPosition | null = null;
    try {
      position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 });
      });
    } catch (e) { logger.ui.error('EmergencyButton', 'Could not get position for emergency'); }
    setShowConfirmation(true);
    onTrigger?.(position);
  };

  const callEmergency = () => { window.location.href = 'tel:112'; };

  return (
    <>
      <button
        onTouchStart={startHold} onTouchEnd={cancelHold} onTouchCancel={cancelHold}
        onMouseDown={startHold} onMouseUp={cancelHold} onMouseLeave={cancelHold}
        className={cn(
          'relative w-14 h-14 rounded-full flex items-center justify-center transition-all overflow-hidden',
          'bg-gradient-to-br from-destructive to-destructive/80 shadow-lg',
          isHolding && 'scale-110', className
        )}
        aria-label={t('emergency.ariaLabel')}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="4"
            strokeDasharray={`${holdProgress * 2.89} 289`} className="transition-all duration-100" />
        </svg>
        <Shield className={cn("h-6 w-6 text-primary-foreground relative z-10 transition-transform", isHolding && "animate-pulse")} />
      </button>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="glass-strong border-destructive/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t('emergency.alertActivated')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('emergency.gpsShared')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Button onClick={callEmergency}
              className="w-full h-14 bg-destructive hover:bg-destructive/90 text-primary-foreground rounded-xl flex items-center justify-center gap-3">
              <Phone className="h-5 w-5" />
              {t('emergency.call112')}
            </Button>
            <p className="text-xs text-muted-foreground text-center">{t('emergency.callEmergencyHelp')}</p>
            <Button variant="outline" onClick={() => { setShowConfirmation(false); toast.success(t('emergency.alertCancelled')); }} className="w-full">
              {t('emergency.allGoodCancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
