import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const CONSENT_KEY = 'easy-cookie-consent';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

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
    <div className="fixed bottom-24 left-4 right-4 z-40 animate-slide-up sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="glass-strong rounded-2xl p-4 shadow-xl border border-border bg-card">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍪</span>
            <h3 className="font-semibold text-foreground text-sm">Cookies & données</h3>
          </div>
          <button 
            onClick={handleDecline}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          EASY utilise des cookies pour améliorer ton expérience et analyser l'utilisation de l'app. 
          Ta position n'est jamais stockée sans ton consentement.
        </p>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecline}
            className="flex-1 h-9 text-xs rounded-lg"
          >
            Refuser
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="flex-1 h-9 text-xs bg-coral hover:bg-coral-dark text-primary-foreground rounded-lg"
          >
            Accepter
          </Button>
        </div>
        
        <a 
          href="/privacy" 
          className="block text-center text-[10px] text-muted-foreground hover:text-coral mt-2"
        >
          En savoir plus sur notre politique de confidentialité
        </a>
      </div>
    </div>
  );
}
