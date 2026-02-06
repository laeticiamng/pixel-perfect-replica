import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Check, X, Loader2, ArrowLeft, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/PageLayout';
import { QRCodeScanner } from '@/components/events';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';

export default function EventCheckinPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { checkInToEvent, isParticipating } = useEvents();
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  
  const secret = searchParams.get('secret');

  useEffect(() => {
    if (eventId && secret && user && status === 'idle') {
      handleCheckin(secret);
    }
  }, [eventId, secret, user, status]);

  // SEC-05 FIX: Use secure RPC instead of direct UPDATE
  const handleCheckin = async (qrSecret: string) => {
    if (!eventId || !user) return;
    
    setStatus('loading');
    setErrorMessage(null);

    try {
      if (!isParticipating(eventId)) {
        throw new Error(t('eventCheckin.mustJoinFirst'));
      }

      const urlMatch = qrSecret.match(/secret=([^&]+)/);
      const extractedSecret = urlMatch ? urlMatch[1] : qrSecret;

      const { error } = await checkInToEvent(eventId, extractedSecret);

      if (error) {
        throw error;
      }

      setStatus('success');
      toast.success(t('eventCheckin.success'));
      
      setTimeout(() => {
        navigate(`/events/${eventId}`);
      }, 2000);
    } catch (err) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : t('eventCheckin.checkinError');
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleScanResult = async (data: string) => {
    const urlMatch = data.match(/events\/([^/]+)\/checkin\?secret=([^&]+)/);
    
    if (urlMatch) {
      const scannedEventId = urlMatch[1];
      const scannedSecret = urlMatch[2];
      
      if (scannedEventId !== eventId) {
        throw new Error(t('eventCheckin.wrongEvent'));
      }
      
      await handleCheckin(scannedSecret);
    } else {
      throw new Error(t('eventCheckin.invalidQr'));
    }
  };

  if (!user) {
    return (
      <PageLayout className="pb-24 safe-bottom">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="glass border-0 m-4">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">{t('eventCheckin.loginRequired')}</p>
              <Button onClick={() => navigate('/')} className="bg-coral hover:bg-coral-dark">{t('eventCheckin.login')}</Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="pb-24 safe-bottom">
      <header className="safe-top px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/events')} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label={t('back')}>
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('eventCheckin.title')}</h1>
        </div>
      </header>

      <div className="px-6 flex items-center justify-center min-h-[70vh]">
        <Card className="glass border-0 w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>
              {status === 'loading' && t('eventCheckin.verifying')}
              {status === 'success' && t('eventCheckin.success')}
              {status === 'error' && t('eventCheckin.error')}
              {status === 'idle' && t('eventCheckin.eventCheckin')}
            </CardTitle>
            <CardDescription>
              {status === 'idle' && !secret && t('eventCheckin.scanQrCode')}
              {status === 'idle' && secret && t('eventCheckin.verifyingInProgress')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              {status === 'loading' && (
                <div className="w-24 h-24 rounded-full bg-coral/20 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 text-coral animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="w-24 h-24 rounded-full bg-signal-green/20 flex items-center justify-center animate-pulse">
                  <Check className="h-12 w-12 text-signal-green" />
                </div>
              )}
              {status === 'error' && (
                <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X className="h-12 w-12 text-destructive" />
                </div>
              )}
              {status === 'idle' && !secret && (
                <div className="w-24 h-24 rounded-full bg-coral/20 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-coral" />
                </div>
              )}
            </div>

            {status === 'error' && errorMessage && (
              <p className="text-center text-destructive">{errorMessage}</p>
            )}

            {status === 'success' && (
              <p className="text-center text-signal-green font-semibold">{t('eventCheckin.presenceConfirmed')}</p>
            )}

            {status === 'idle' && !secret && (
              <Button onClick={() => setShowScanner(true)} className="w-full h-14 bg-coral hover:bg-coral-dark gap-2 rounded-xl">
                <Camera className="h-5 w-5" />{t('eventCheckin.scanButton')}
              </Button>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Button onClick={() => setShowScanner(true)} className="w-full bg-coral hover:bg-coral-dark">{t('eventCheckin.retryWithScanner')}</Button>
                <Button variant="outline" onClick={() => navigate(`/events/${eventId}`)} className="w-full">{t('eventCheckin.backToEvent')}</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <QRCodeScanner isOpen={showScanner} onClose={() => setShowScanner(false)} onScan={handleScanResult} />
    </PageLayout>
  );
}