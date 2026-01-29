import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Check, X, Loader2, ArrowLeft, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/PageLayout';
import { QRCodeScanner } from '@/components/events';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export default function EventCheckinPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkInToEvent, isParticipating } = useEvents();
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  
  const secret = searchParams.get('secret');

  // Auto check-in if we have the secret in URL
  useEffect(() => {
    if (eventId && secret && user && status === 'idle') {
      handleCheckin(secret);
    }
  }, [eventId, secret, user, status]);

  const handleCheckin = async (qrSecret: string) => {
    if (!eventId || !user) return;
    
    setStatus('loading');
    setErrorMessage(null);

    try {
      // Verify the secret matches the event
      const { data: event, error: eventError } = await supabase
        .rpc('get_event_for_user', { p_event_id: eventId });

      if (eventError || !event || event.length === 0) {
        throw new Error('Événement non trouvé');
      }

      // Check if user is a participant
      if (!isParticipating(eventId)) {
        throw new Error('Tu dois d\'abord rejoindre l\'événement');
      }

      // Verify the QR code secret (extract from URL if it's a full URL)
      const urlMatch = qrSecret.match(/secret=([^&]+)/);
      const extractedSecret = urlMatch ? urlMatch[1] : qrSecret;

      // We can't check the secret directly since it's hidden from non-organizers
      // The backend RLS will validate this

      // Update the participant's check-in status
      const { error: checkinError } = await supabase
        .from('event_participants')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (checkinError) {
        throw new Error('Erreur lors du check-in');
      }

      setStatus('success');
      toast.success('Check-in réussi !');
      
      // Redirect to event page after success
      setTimeout(() => {
        navigate(`/events/${eventId}`);
      }, 2000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erreur inconnue');
      toast.error(err instanceof Error ? err.message : 'Erreur lors du check-in');
    }
  };

  const handleScanResult = async (data: string) => {
    // Extract event ID and secret from scanned URL
    const urlMatch = data.match(/events\/([^/]+)\/checkin\?secret=([^&]+)/);
    
    if (urlMatch) {
      const scannedEventId = urlMatch[1];
      const scannedSecret = urlMatch[2];
      
      if (scannedEventId !== eventId) {
        throw new Error('Ce QR code n\'est pas pour cet événement');
      }
      
      await handleCheckin(scannedSecret);
    } else {
      throw new Error('QR code invalide');
    }
  };

  if (!user) {
    return (
      <PageLayout className="pb-24 safe-bottom">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="glass border-0 m-4">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">Connecte-toi pour faire le check-in</p>
              <Button onClick={() => navigate('/')} className="bg-coral hover:bg-coral-dark">
                Se connecter
              </Button>
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
          <button
            onClick={() => navigate('/events')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Check-in</h1>
        </div>
      </header>

      <div className="px-6 flex items-center justify-center min-h-[70vh]">
        <Card className="glass border-0 w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>
              {status === 'loading' && 'Vérification...'}
              {status === 'success' && 'Check-in réussi !'}
              {status === 'error' && 'Erreur'}
              {status === 'idle' && 'Check-in événement'}
            </CardTitle>
            <CardDescription>
              {status === 'idle' && !secret && 'Scanne le QR code de l\'organisateur'}
              {status === 'idle' && secret && 'Vérification en cours...'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status Display */}
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

            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <p className="text-center text-destructive">{errorMessage}</p>
            )}

            {/* Success Message */}
            {status === 'success' && (
              <p className="text-center text-signal-green font-semibold">
                Ta présence est confirmée ! 🎉
              </p>
            )}

            {/* Actions */}
            {status === 'idle' && !secret && (
              <Button
                onClick={() => setShowScanner(true)}
                className="w-full h-14 bg-coral hover:bg-coral-dark gap-2 rounded-xl"
              >
                <Camera className="h-5 w-5" />
                Scanner le QR Code
              </Button>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Button
                  onClick={() => setShowScanner(true)}
                  className="w-full bg-coral hover:bg-coral-dark"
                >
                  Réessayer avec scanner
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/events/${eventId}`)}
                  className="w-full"
                >
                  Retour à l'événement
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR Scanner Modal */}
      <QRCodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanResult}
      />
    </PageLayout>
  );
}
