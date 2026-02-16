import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { X, Camera, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { logger } from '@/lib/logger';

interface QRCodeScannerProps {
  onScan: (data: string) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

export function QRCodeScanner({ onScan, onClose, isOpen }: QRCodeScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasCamera, setHasCamera] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then(() => setHasCamera(true))
        .catch(() => {
          setHasCamera(false);
          setErrorMessage(t('qrScanner.cameraError'));
        });
    }
  }, [isOpen]);

  const handleScan = async (result: { rawValue: string }[]) => {
    if (isProcessing || result.length === 0) return;
    
    const data = result[0].rawValue;
    if (!data) return;

    setIsProcessing(true);
    setScanStatus('idle');

    try {
      await onScan(data);
      setScanStatus('success');
      toast.success(t('qrScanner.checkinSuccess'));
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setScanStatus('error');
      setErrorMessage(err instanceof Error ? err.message : t('qrScanner.scanError'));
      toast.error(t('qrScanner.checkinError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (error: Error) => {
    logger.ui.error('QRCodeScanner', String(error));
    setErrorMessage(error.message || t('qrScanner.cameraErrorGeneric'));
    setHasCamera(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md glass border-0 overflow-hidden">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
            aria-label={t('close')}
          >
            <X className="h-5 w-5" />
          </button>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-coral" />
            {t('qrScanner.scanQR')}
          </CardTitle>
          <CardDescription>
            {t('qrScanner.scanDesc')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Scanner Area */}
          <div className={cn(
            "relative aspect-square rounded-xl overflow-hidden bg-muted/50",
            scanStatus === 'success' && "ring-4 ring-signal-green",
            scanStatus === 'error' && "ring-4 ring-destructive"
          )}>
            {hasCamera && scanStatus === 'idle' && !isProcessing && (
              <Scanner
                onScan={handleScan}
                onError={handleError}
                formats={['qr_code']}
                styles={{
                  container: { width: '100%', height: '100%' },
                  video: { width: '100%', height: '100%', objectFit: 'cover' }
                }}
                components={{ torch: true, finder: true }}
              />
            )}

            {/* Status Overlay */}
            {(scanStatus !== 'idle' || isProcessing) && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                {isProcessing && (
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-coral mx-auto mb-3" />
                    <p className="text-muted-foreground">{t('qrScanner.verifying')}</p>
                  </div>
                )}
                {scanStatus === 'success' && (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-signal-green/20 flex items-center justify-center mx-auto mb-3">
                      <Check className="h-8 w-8 text-signal-green" />
                    </div>
                    <p className="font-semibold text-signal-green">{t('qrScanner.checkinSuccess')}</p>
                  </div>
                )}
                {scanStatus === 'error' && (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <p className="font-semibold text-destructive">{t('qrScanner.error')}</p>
                    <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
                  </div>
                )}
              </div>
            )}

            {/* No Camera */}
            {!hasCamera && scanStatus === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold text-foreground mb-2">{t('qrScanner.cameraUnavailable')}</p>
                  <p className="text-sm text-muted-foreground">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Scanning Overlay */}
            {hasCamera && scanStatus === 'idle' && !isProcessing && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-coral rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-coral rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-coral rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-coral rounded-br-lg" />
                <div className="absolute left-4 right-4 h-0.5 bg-coral/80 animate-scan-line" 
                     style={{ animation: 'scanLine 2s ease-in-out infinite' }} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t('cancel')}
            </Button>
            {scanStatus === 'error' && (
              <Button
                onClick={() => { setScanStatus('idle'); setErrorMessage(null); }}
                className="flex-1 bg-coral hover:bg-coral-dark"
              >
                {t('qrScanner.retry')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 20%; opacity: 0.5; }
          50% { top: 80%; opacity: 1; }
        }
        .animate-scan-line {
          animation: scanLine 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
