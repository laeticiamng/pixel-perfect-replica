import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Smartphone, Share, Plus, MoreVertical, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/PageLayout';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <PageLayout showSidebar={false} className="pb-8 safe-bottom">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Installer EASY</h1>
      </header>

      <div className="px-6 space-y-8 animate-slide-up">
        {/* Hero */}
        <div className="text-center py-8">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-xl glow-coral">
              <span className="text-4xl font-bold text-white">E</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-signal-green flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isInstalled ? 'App installée ! 🎉' : 'Installez EASY'}
          </h2>
          <p className="text-muted-foreground">
            {isInstalled 
              ? 'Vous pouvez maintenant utiliser EASY depuis votre écran d\'accueil'
              : 'Accédez à EASY directement depuis votre écran d\'accueil'
            }
          </p>
        </div>

        {isInstalled ? (
          <div className="glass rounded-2xl p-6 text-center border-2 border-signal-green/30">
            <div className="w-16 h-16 rounded-full bg-signal-green/20 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-signal-green" />
            </div>
            <p className="text-foreground font-medium mb-4">
              EASY est installé sur votre appareil !
            </p>
            <Button
              onClick={() => navigate('/map')}
              className="bg-coral hover:bg-coral-dark text-white rounded-xl"
            >
              Retour à l'app
            </Button>
          </div>
        ) : (
          <>
            {/* Native Install Button (Android/Chrome) */}
            {deferredPrompt && (
              <Button
                onClick={handleInstallClick}
                size="lg"
                className="w-full h-14 bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-white font-bold rounded-2xl shadow-lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Installer maintenant
              </Button>
            )}

            {/* iOS Instructions */}
            {isIOS && !deferredPrompt && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-coral" />
                  Sur iPhone/iPad
                </h3>
                
                <div className="space-y-3">
                  <div className="glass rounded-xl p-4 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-coral font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Appuyez sur le bouton Partager</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Share className="h-4 w-4" /> Icône carré avec flèche vers le haut
                      </p>
                    </div>
                  </div>
                  
                  <div className="glass rounded-xl p-4 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-coral font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Sélectionnez "Sur l'écran d'accueil"</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Plus className="h-4 w-4" /> Faire défiler si nécessaire
                      </p>
                    </div>
                  </div>
                  
                  <div className="glass rounded-xl p-4 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-coral font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Appuyez sur "Ajouter"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        EASY apparaîtra sur votre écran d'accueil
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Android Instructions */}
            {isAndroid && !deferredPrompt && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-coral" />
                  Sur Android
                </h3>
                
                <div className="space-y-3">
                  <div className="glass rounded-xl p-4 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-coral font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Ouvrez le menu Chrome</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MoreVertical className="h-4 w-4" /> Les 3 points en haut à droite
                      </p>
                    </div>
                  </div>
                  
                  <div className="glass rounded-xl p-4 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-coral font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Sélectionnez "Installer l'application"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ou "Ajouter à l'écran d'accueil"
                      </p>
                    </div>
                  </div>
                  
                  <div className="glass rounded-xl p-4 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-coral font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Confirmez l'installation</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        L'app sera installée sur votre téléphone
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop fallback */}
            {!isIOS && !isAndroid && !deferredPrompt && (
              <div className="glass rounded-xl p-6 text-center">
                <Smartphone className="h-12 w-12 text-coral mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">
                  Ouvrez cette page sur votre téléphone
                </p>
                <p className="text-sm text-muted-foreground">
                  L'installation n'est disponible que sur mobile
                </p>
              </div>
            )}

            {/* Benefits */}
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Pourquoi installer ?
              </h3>
              
              <div className="grid gap-3">
                {[
                  { emoji: '⚡', text: 'Chargement instantané' },
                  { emoji: '📴', text: 'Fonctionne hors connexion' },
                  { emoji: '🔔', text: 'Notifications en temps réel' },
                  { emoji: '🎯', text: 'Accès rapide depuis l\'écran d\'accueil' },
                ].map((benefit) => (
                  <div key={benefit.text} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                    <span className="text-xl">{benefit.emoji}</span>
                    <span className="text-foreground font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
