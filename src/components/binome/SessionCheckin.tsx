import { useState, useEffect } from 'react';
import { MapPin, Check, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { useTranslation } from '@/lib/i18n';
import { calculateDistance } from '@/utils/distance';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SessionCheckinProps {
  sessionId: string;
  sessionLocation?: { latitude: number; longitude: number; name?: string };
  scheduledDate: string;
  startTime: string;
  onCheckinComplete?: () => void;
  onCheckoutComplete?: () => void;
}

const MAX_CHECKIN_DISTANCE = 200;
const CHECKIN_WINDOW_MINUTES = 15;

export function SessionCheckin({ sessionId, sessionLocation, scheduledDate, startTime, onCheckinComplete, onCheckoutComplete }: SessionCheckinProps) {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const { position, startWatching } = useLocationStore();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkinTime, setCheckinTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => { startWatching(); }, [startWatching]);

  useEffect(() => {
    if (position && sessionLocation) {
      setDistance(Math.round(calculateDistance(position.latitude, position.longitude, sessionLocation.latitude, sessionLocation.longitude)));
    }
  }, [position, sessionLocation]);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      const { data } = await supabase.from('session_participants')
        .select('checked_in, checked_in_at, checked_out, checked_out_at')
        .eq('session_id', sessionId).eq('user_id', user.id).single();
      if (data) {
        setIsCheckedIn(data.checked_in);
        setIsCheckedOut(data.checked_out);
        if (data.checked_in_at) setCheckinTime(new Date(data.checked_in_at));
      }
    };
    fetchStatus();
  }, [user, sessionId]);

  const isWithinCheckinWindow = (): boolean => {
    const sessionDateTime = new Date(`${scheduledDate}T${startTime}`);
    const now = new Date();
    return now >= new Date(sessionDateTime.getTime() - CHECKIN_WINDOW_MINUTES * 60 * 1000) && now <= new Date(sessionDateTime.getTime() + 60 * 60 * 1000);
  };

  const isCloseEnough = (): boolean => {
    if (!sessionLocation) return true;
    return distance !== null && distance <= MAX_CHECKIN_DISTANCE;
  };

  const handleCheckin = async () => {
    if (!user) return;
    if (!isWithinCheckinWindow()) { toast.error(t('sessionCheckin.cantCheckinYet')); return; }
    if (!isCloseEnough()) { toast.error(t('sessionCheckin.tooFar').replace('{distance}', String(distance)).replace('{max}', String(MAX_CHECKIN_DISTANCE))); return; }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('session_participants')
        .update({ checked_in: true, checked_in_at: new Date().toISOString() })
        .eq('session_id', sessionId).eq('user_id', user.id);
      if (error) throw error;
      setIsCheckedIn(true);
      setCheckinTime(new Date());
      toast.success(t('sessionCheckin.checkinSuccess'));
      onCheckinComplete?.();
    } catch (error) {
      console.error('[SessionCheckin] Checkin error:', error);
      toast.error(t('sessionCheckin.checkinErrorToast'));
    } finally { setIsLoading(false); }
  };

  const handleCheckout = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('session_participants')
        .update({ checked_out: true, checked_out_at: new Date().toISOString() })
        .eq('session_id', sessionId).eq('user_id', user.id);
      if (error) throw error;
      setIsCheckedOut(true);
      toast.success(t('sessionCheckin.checkoutSuccess'));
      onCheckoutComplete?.();
    } catch (error) {
      console.error('[SessionCheckin] Checkout error:', error);
      toast.error(t('sessionCheckin.checkoutError'));
    } finally { setIsLoading(false); }
  };

  if (isCheckedOut) {
    return (
      <Card className="glass">
        <CardContent className="py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-signal-green/20 flex items-center justify-center mx-auto mb-3">
            <Check className="h-6 w-6 text-signal-green" />
          </div>
          <p className="font-medium text-foreground">{t('sessionCheckin.sessionEnded')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('sessionCheckin.thanksForParticipating')}</p>
        </CardContent>
      </Card>
    );
  }

  if (isCheckedIn) {
    return (
      <Card className="glass border-signal-green/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Check className="h-5 w-5 text-signal-green" />{t('sessionCheckin.checkinDone')}
            </CardTitle>
            <Badge variant="outline" className="bg-signal-green/10 text-signal-green border-signal-green/30">
              {checkinTime?.toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCheckout} disabled={isLoading} variant="outline" className="w-full">
            {isLoading ? t('sessionCheckin.inProgress') : t('sessionCheckin.endSession')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const canCheckin = isWithinCheckinWindow() && isCloseEnough();

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('sessionCheckin.attendance')}</CardTitle>
        <CardDescription>{t('sessionCheckin.confirmPresence')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Clock className={cn("h-4 w-4", isWithinCheckinWindow() ? "text-signal-green" : "text-muted-foreground")} />
            <span className={cn(isWithinCheckinWindow() ? "text-foreground" : "text-muted-foreground")}>
              {isWithinCheckinWindow() ? t('sessionCheckin.checkinWindowOpen') : t('sessionCheckin.checkinBefore')}
            </span>
          </div>
          {sessionLocation && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className={cn("h-4 w-4", isCloseEnough() ? "text-signal-green" : "text-signal-yellow")} />
              <span className={cn(isCloseEnough() ? "text-foreground" : "text-signal-yellow")}>
                {distance !== null
                  ? (distance > MAX_CHECKIN_DISTANCE
                    ? t('sessionCheckin.tooFarMax').replace('{distance}', String(distance)).replace('{max}', String(MAX_CHECKIN_DISTANCE))
                    : t('sessionCheckin.distanceFromVenue').replace('{distance}', String(distance)))
                  : t('sessionCheckin.locating')}
              </span>
            </div>
          )}
        </div>

        <Button onClick={handleCheckin} disabled={isLoading || !canCheckin} className="w-full bg-coral hover:bg-coral/90">
          {isLoading ? t('sessionCheckin.inProgress') : canCheckin ? t('events.checkIn') : t('sessionCheckin.checkinNotAvailable')}
        </Button>

        {!canCheckin && (
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {!isWithinCheckinWindow() ? t('sessionCheckin.comeBackCloser') : t('sessionCheckin.getCloser')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}