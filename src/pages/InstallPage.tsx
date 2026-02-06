import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Download, Smartphone, Share, Plus, MoreVertical, Check,
  Sparkles, Chrome, Apple, Wifi, Bell, Zap, Home, Monitor,
} from "lucide-react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

const benefitVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1, x: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 },
  },
};

const triggerConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) { clearInterval(interval); return; }
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ["#FF6B6B", "#FF8E8E", "#FFB4B4", "#4ECDC4", "#45B7AA"] });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ["#FF6B6B", "#FF8E8E", "#FFB4B4", "#4ECDC4", "#45B7AA"] });
  }, 250);
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallStep = ({ step, icon: Icon, title, description, highlight, index = 0 }: {
  step: number; icon: React.ElementType; title: string; description: string; highlight?: string; index?: number;
}) => (
  <motion.div variants={itemVariants} whileHover={{ scale: 1.02, transition: { duration: 0.2 } }} whileTap={{ scale: 0.98 }}>
    <Card className="border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <motion.div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center text-white font-bold shadow-lg"
              initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 + index * 0.15 }}>
              {step}
            </motion.div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
            {highlight && (
              <motion.div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-coral/10 border border-coral/20"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + index * 0.15 }}>
                <Icon className="h-4 w-4 text-coral" />
                <span className="text-sm font-medium text-coral">{highlight}</span>
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const BenefitItem = ({ icon: Icon, text, index = 0 }: { icon?: React.ElementType; text: string; index?: number; }) => (
  <motion.div variants={benefitVariants} whileHover={{ x: 8, transition: { duration: 0.2 } }}
    className="flex items-center gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 cursor-default">
    {Icon && (
      <motion.div className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center"
        initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.4 + index * 0.1 }}>
        <Icon className="h-4 w-4 text-coral" />
      </motion.div>
    )}
    <span className="text-foreground font-medium">{text}</span>
  </motion.div>
);

export default function InstallPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));
    setIsSafari(/Safari/.test(ua) && !/Chrome/.test(ua));
    if (window.matchMedia("(display-mode: standalone)").matches) setIsInstalled(true);
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e as BeforeInstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => { setIsInstalled(true); setDeferredPrompt(null); triggerConfetti(); });
    return () => { window.removeEventListener("beforeinstallprompt", handler); };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") { setIsInstalled(true); triggerConfetti(); }
    setDeferredPrompt(null);
  };

  const getPlatformName = () => {
    if (isIOS) return "iPhone/iPad";
    if (isAndroid) return "Android";
    return t('install.yourDevice');
  };

  return (
    <PageLayout showSidebar={false} className="pb-8 safe-bottom">
      <header className="safe-top sticky top-0 z-10 px-6 py-4 flex items-center gap-4 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label={t('install.backLabel')}>
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('install.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('install.subtitle')}</p>
        </div>
      </header>

      <div className="px-6 space-y-8 animate-slide-up">
        {/* Hero */}
        <div className="text-center py-6">
          <div className="relative inline-block mb-6">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-2xl glow-coral ring-4 ring-coral/20">
              <img src="/easy-logo.png" alt="EASY Logo" className="w-16 h-16 object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; const s = document.createElement("span"); s.className = "text-5xl font-bold text-white"; s.textContent = "E"; e.currentTarget.parentElement?.appendChild(s); }} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-signal-green flex items-center justify-center shadow-lg ring-2 ring-background">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {isInstalled ? t('install.installedAlready') : t('install.installedTitle').replace('{platform}', getPlatformName())}
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {isInstalled ? t('install.installedDesc') : t('install.notInstalledDesc')}
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-2 border-signal-green/30 bg-signal-green/5">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-signal-green/20 flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-signal-green" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t('install.successTitle')}</h3>
              <p className="text-muted-foreground mb-6">{t('install.successDesc')}</p>
              <Button onClick={() => navigate("/map")} size="lg" className="bg-coral hover:bg-coral-dark text-white rounded-xl w-full">
                <Home className="mr-2 h-5 w-5" />
                {t('install.backToApp')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Native Install */}
            {deferredPrompt && (
              <Card className="border-2 border-coral/30 bg-gradient-to-br from-coral/5 to-coral/10">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-4">
                    <Download className="h-8 w-8 text-coral" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{t('install.oneClick')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('install.browserSupports')}</p>
                  <Button onClick={handleInstallClick} size="lg" className="w-full h-14 bg-gradient-to-r from-coral to-coral-dark hover:from-coral-dark hover:to-coral text-white font-bold rounded-2xl shadow-lg">
                    <Download className="mr-2 h-5 w-5" />
                    {t('install.installNow')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* iOS Instructions */}
            {isIOS && !deferredPrompt && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                    <Apple className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t('install.iosDetected')}</p>
                    <p className="text-sm text-muted-foreground">{isSafari ? t('install.safariLabel') : t('install.openSafari')}</p>
                  </div>
                </div>
                {!isSafari && (
                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4">
                      <p className="text-sm text-destructive">{t('install.safariWarning')}</p>
                    </CardContent>
                  </Card>
                )}
                <h3 className="text-lg font-bold text-foreground pt-2">{t('install.howToInstall')}</h3>
                <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
                  <InstallStep step={1} icon={Share} title={t('install.iosStep1Title')} description={t('install.iosStep1Desc')} highlight={t('install.iosStep1Highlight')} index={0} />
                  <InstallStep step={2} icon={Plus} title={t('install.iosStep2Title')} description={t('install.iosStep2Desc')} highlight={t('install.iosStep2Highlight')} index={1} />
                  <InstallStep step={3} icon={Check} title={t('install.iosStep3Title')} description={t('install.iosStep3Desc')} index={2} />
                </motion.div>
              </div>
            )}

            {/* Android Instructions */}
            {isAndroid && !deferredPrompt && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="w-10 h-10 rounded-full bg-signal-green/20 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-signal-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t('install.androidDetected')}</p>
                    <p className="text-sm text-muted-foreground">{t('install.androidOptimal')}</p>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground pt-2">{t('install.howToInstall')}</h3>
                <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
                  <InstallStep step={1} icon={MoreVertical} title={t('install.androidStep1Title')} description={t('install.androidStep1Desc')} highlight="Menu ⋮" index={0} />
                  <InstallStep step={2} icon={Download} title={t('install.androidStep2Title')} description={t('install.androidStep2Desc')} highlight={t('install.androidStep2Highlight')} index={1} />
                  <InstallStep step={3} icon={Check} title={t('install.androidStep3Title')} description={t('install.androidStep3Desc')} index={2} />
                </motion.div>
              </div>
            )}

            {/* Desktop fallback */}
            {!isIOS && !isAndroid && !deferredPrompt && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card className="border-border overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Monitor className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-foreground">{t('install.desktopDetected')}</h3>
                        <p className="text-sm text-muted-foreground">{t('install.scanQr')}</p>
                      </div>
                    </div>
                    <motion.div className="flex justify-center mb-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
                      <div className="relative p-4 bg-white rounded-2xl shadow-lg">
                        <QRCodeSVG value={window.location.href} size={180} level="H" includeMargin={false} bgColor="#FFFFFF" fgColor="#1a1a2e" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-md">
                            <span className="text-xl font-bold text-white">E</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    <div className="text-center space-y-3">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Smartphone className="h-4 w-4" />
                        <span>{t('install.pointCamera')}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground px-2">{t('install.orLabel')}</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('install.chromeDesktop')}{" "}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted">
                          <Download className="h-3 w-3" />
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Benefits */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-foreground">{t('install.whyInstall')}</h3>
              <motion.div className="grid gap-3" variants={containerVariants} initial="hidden" animate="visible">
                <BenefitItem icon={Zap} text={t('install.benefitFast')} index={0} />
                <BenefitItem icon={Wifi} text={t('install.benefitOffline')} index={1} />
                <BenefitItem icon={Bell} text={t('install.benefitNotifications')} index={2} />
                <BenefitItem icon={Home} text={t('install.benefitHomeScreen')} index={3} />
              </motion.div>
              <p className="text-xs text-muted-foreground text-center pt-2">{t('install.pwaNote')}</p>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
