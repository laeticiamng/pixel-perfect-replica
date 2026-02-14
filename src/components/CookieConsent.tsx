import { useState, useEffect, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const CONSENT_KEY = 'nearvity-cookie-consent';

export const CookieConsent = forwardRef<HTMLDivElement>(function CookieConsent(_props, ref) {
  const [showBanner, setShowBanner] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Delay showing to not interrupt initial load
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      preferences: { analytics: true, functional: true }
    }));
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      accepted: false,
      timestamp: new Date().toISOString(),
      preferences: { analytics: false, functional: true }
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div ref={ref} className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="glass-strong rounded-2xl p-4 shadow-xl border border-border bg-card">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-coral" />
            <h3 className="font-semibold text-foreground text-sm">{t('cookies.title')}</h3>
          </div>
          <button 
            onClick={handleDecline}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          {t('cookies.description')}
        </p>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecline}
            className="flex-1 h-11 min-h-[44px] text-xs rounded-lg"
          >
            {t('cookies.decline')}
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="flex-1 h-11 min-h-[44px] text-xs bg-coral hover:bg-coral-dark text-primary-foreground rounded-lg"
          >
            {t('cookies.accept')}
          </Button>
        </div>
        
        <Link 
          to="/privacy" 
          className="block text-center text-[10px] text-muted-foreground hover:text-coral mt-2"
        >
          {t('cookies.learnMore')}
        </Link>
      </div>
    </div>
  );
});

CookieConsent.displayName = 'CookieConsent';
