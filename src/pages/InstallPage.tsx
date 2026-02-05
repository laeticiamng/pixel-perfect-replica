import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Smartphone,
  Share,
  Plus,
  MoreVertical,
  Check,
  Sparkles,
  Chrome,
  Apple,
  Wifi,
  Bell,
  Zap,
  Home,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallStep = ({
  step,
  icon: Icon,
  title,
  description,
  highlight,
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  description: string;
  highlight?: string;
}) => (
  <Card className="border-0 bg-card/50 backdrop-blur-sm">
    <CardContent className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center text-white font-bold shadow-lg">
            {step}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          {highlight && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-coral/10 border border-coral/20">
              <Icon className="h-4 w-4 text-coral" />
              <span className="text-sm font-medium text-coral">{highlight}</span>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const BenefitItem = ({
  icon: Icon,
  emoji,
  text,
}: {
  icon?: React.ElementType;
  emoji?: string;
  text: string;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
    {emoji ? (
      <span className="text-xl">{emoji}</span>
    ) : Icon ? (
      <div className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-coral" />
      </div>
    ) : null}
    <span className="text-foreground font-medium">{text}</span>
  </div>
);

export default function InstallPage() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
    const isAndroidDevice = /Android/.test(ua);
    const isSafariBrowser = /Safari/.test(ua) && !/Chrome/.test(ua);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsSafari(isSafariBrowser);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if app was installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const getPlatformName = () => {
    if (isIOS) return "iPhone/iPad";
    if (isAndroid) return "Android";
    return "votre appareil";
  };

  return (
    <PageLayout showSidebar={false} className="pb-8 safe-bottom">
      {/* Header */}
      <header className="safe-top sticky top-0 z-10 px-6 py-4 flex items-center gap-4 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Installer EASY</h1>
          <p className="text-xs text-muted-foreground">
            Application Web Progressive (PWA)
          </p>
        </div>
      </header>

      <div className="px-6 space-y-8 animate-slide-up">
        {/* Hero */}
        <div className="text-center py-6">
          <div className="relative inline-block mb-6">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-2xl glow-coral ring-4 ring-coral/20">
              <img
                src="/easy-logo.png"
                alt="EASY Logo"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML =
                    '<span class="text-5xl font-bold text-white">E</span>';
                }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-signal-green flex items-center justify-center shadow-lg ring-2 ring-background">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">
            {isInstalled ? "App installée ! 🎉" : `Installez EASY sur ${getPlatformName()}`}
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {isInstalled
              ? "Vous pouvez maintenant utiliser EASY depuis votre écran d'accueil comme une vraie application"
              : "Installez EASY pour un accès rapide, des notifications et une expérience optimale"}
          </p>
        </div>

        {isInstalled ? (
          /* Success State */
          <Card className="border-2 border-signal-green/30 bg-signal-green/5">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-signal-green/20 flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-signal-green" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Installation réussie !
              </h3>
              <p className="text-muted-foreground mb-6">
                EASY est maintenant installé sur votre appareil. Retrouvez
                l'icône sur votre écran d'accueil.
              </p>
              <Button
                onClick={() => navigate("/map")}
                size="lg"
                className="bg-coral hover:bg-coral-dark text-white rounded-xl w-full"
              >
                <Home className="mr-2 h-5 w-5" />
                Retour à l'application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Native Install Button (Android/Chrome) */}
            {deferredPrompt && (
              <Card className="border-2 border-coral/30 bg-gradient-to-br from-coral/5 to-coral/10">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-4">
                    <Download className="h-8 w-8 text-coral" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Installation en un clic
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Votre navigateur supporte l'installation directe
                  </p>
                  <Button
                    onClick={handleInstallClick}
                    size="lg"
                    className="w-full h-14 bg-gradient-to-r from-coral to-coral-dark hover:from-coral-dark hover:to-coral text-white font-bold rounded-2xl shadow-lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Installer EASY maintenant
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* iOS Instructions */}
            {isIOS && !deferredPrompt && (
              <div className="space-y-4">
                {/* Platform indicator */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                    <Apple className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      iPhone / iPad détecté
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isSafari ? "Safari" : "Ouvrez Safari pour installer"}
                    </p>
                  </div>
                </div>

                {!isSafari && (
                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4">
                      <p className="text-sm text-destructive">
                        ⚠️ Pour installer EASY sur iOS, vous devez utiliser{" "}
                        <strong>Safari</strong>. Ouvrez cette page dans Safari
                        pour continuer.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <h3 className="text-lg font-bold text-foreground pt-2">
                  Comment installer en 3 étapes
                </h3>

                <div className="space-y-3">
                  <InstallStep
                    step={1}
                    icon={Share}
                    title="Ouvrez le menu Partager"
                    description="En bas de l'écran Safari, appuyez sur l'icône de partage"
                    highlight="Icône carrée avec flèche ↑"
                  />

                  <InstallStep
                    step={2}
                    icon={Plus}
                    title="Sélectionnez Sur l'écran d'accueil"
                    description="Faites défiler les options vers le bas si nécessaire pour trouver cette option"
                    highlight="Ajouter à l'écran d'accueil"
                  />

                  <InstallStep
                    step={3}
                    icon={Check}
                    title="Appuyez sur Ajouter"
                    description="Confirmez l'ajout en haut à droite. EASY sera ajouté à votre écran d'accueil"
                  />
                </div>
              </div>
            )}

            {/* Android Instructions */}
            {isAndroid && !deferredPrompt && (
              <div className="space-y-4">
                {/* Platform indicator */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="w-10 h-10 rounded-full bg-signal-green/20 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-signal-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Android détecté
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Utilisez Chrome pour une installation optimale
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-foreground pt-2">
                  Comment installer en 3 étapes
                </h3>

                <div className="space-y-3">
                  <InstallStep
                    step={1}
                    icon={MoreVertical}
                    title="Ouvrez le menu Chrome"
                    description="Appuyez sur les 3 points verticaux en haut à droite de votre navigateur"
                    highlight="Menu ⋮"
                  />

                  <InstallStep
                    step={2}
                    icon={Download}
                    title="Sélectionnez Installer l'application"
                    description="Cette option peut aussi s'appeler Ajouter à l'écran d'accueil selon votre version"
                    highlight="Installer l'application"
                  />

                  <InstallStep
                    step={3}
                    icon={Check}
                    title="Confirmez l'installation"
                    description="Appuyez sur Installer dans la popup. EASY sera ajouté comme une application"
                  />
                </div>
              </div>
            )}

            {/* Desktop fallback */}
            {!isIOS && !isAndroid && !deferredPrompt && (
              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Monitor className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Ordinateur détecté
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    L'installation PWA est optimisée pour mobile. Scannez ce QR
                    code ou ouvrez cette page sur votre téléphone.
                  </p>
                  <div className="p-4 bg-muted rounded-xl inline-block">
                    <Smartphone className="h-12 w-12 text-coral mx-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Sur Chrome desktop, vous pouvez aussi cliquer sur l'icône
                    d'installation dans la barre d'adresse
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-foreground">
                Pourquoi installer ?
              </h3>

              <div className="grid gap-3">
                <BenefitItem icon={Zap} text="Chargement ultra-rapide" />
                <BenefitItem icon={Wifi} text="Fonctionne hors connexion" />
                <BenefitItem icon={Bell} text="Notifications en temps réel" />
                <BenefitItem
                  icon={Home}
                  text="Accès direct depuis l'écran d'accueil"
                />
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                EASY est une Progressive Web App (PWA) — pas besoin de passer
                par l'App Store
              </p>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
