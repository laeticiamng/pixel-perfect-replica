import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Ruler, Bell, Volume2, Vibrate, Download, Trash2, ArrowLeft, Shield, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { PageLayout } from '@/components/PageLayout';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const navigate = useNavigate();

  const [ghostMode, setGhostMode] = useState(false);
  const [ghostAnimating, setGhostAnimating] = useState(false);
  const [visibilityDistance, setVisibilityDistance] = useState(500);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [proximityVibration, setProximityVibration] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleGhostToggle = (enabled: boolean) => {
    setGhostAnimating(true);
    setTimeout(() => {
      setGhostMode(enabled);
      setGhostAnimating(false);
      toast.success(enabled ? 'Mode Fantôme activé 👻' : 'Tu es de retour sur le radar !');
    }, 800);
  };

  const handleGDPRExport = () => {
    const data = {
      profile: {
        firstName: 'Alex',
        university: 'Sorbonne Université',
        bio: 'Étudiant en droit',
        createdAt: '2025-09-15T10:00:00Z',
      },
      sessions: [
        { date: '2025-12-01', activity: 'studying', duration: 45, partner: 'Marie' },
        { date: '2025-12-03', activity: 'sport', duration: 60, partner: 'Thomas' },
      ],
      settings: {
        ghostMode,
        visibilityDistance,
        pushNotifications,
        soundNotifications,
        proximityVibration,
      },
      exportDate: new Date().toISOString(),
      exportVersion: '2.0.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nearvity-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Données exportées ! 📦');
  };

  const handleDeleteAccount = () => {
    toast.success('Compte supprimé. À bientôt !');
    setShowDeleteConfirm(false);
    navigate('/');
  };

  return (
    <PageLayout className="pb-28">
      <div className="max-w-[430px] mx-auto w-full">
        {/* Header */}
        <header className="safe-top px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
          </div>
        </header>

        <motion.div
          className="px-6 space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.06, delayChildren: 0.05 },
            },
          }}
        >
          {/* Ghost Mode */}
          <motion.div
            className="relative overflow-hidden"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <AnimatePresence>
              {ghostAnimating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 rounded-xl bg-background/80 backdrop-blur-md flex items-center justify-center"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 0],
                      opacity: [1, 0.5, 0],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl"
                  >
                    👻
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className={cn(
              'glass rounded-xl p-4 transition-all duration-500',
              ghostMode && 'border-violet/30 bg-violet/5'
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'p-2 rounded-lg transition-colors',
                    ghostMode ? 'bg-violet/20 text-violet' : 'bg-muted text-muted-foreground'
                  )}>
                    {ghostMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Mode Fantôme</span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {ghostMode ? 'Tu es invisible sur le radar' : 'Deviens invisible pour les autres'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={ghostMode}
                  onCheckedChange={handleGhostToggle}
                />
              </div>
            </div>
          </motion.div>

          {/* Visibility Distance */}
          <motion.div
            className="glass rounded-xl p-4"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                <Ruler className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-foreground">Rayon de détection</span>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {visibilityDistance >= 1000
                    ? `${(visibilityDistance / 1000).toFixed(1)} km`
                    : `${visibilityDistance}m`
                  }
                </p>
              </div>
            </div>
            <div className="px-1">
              <Slider
                value={[visibilityDistance]}
                onValueChange={([value]) => setVisibilityDistance(value)}
                min={100}
                max={2000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>100m</span>
                <span>1km</span>
                <span>2km</span>
              </div>
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            className="glass rounded-xl overflow-hidden"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="px-4 py-3 border-b border-white/5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Notifications
              </span>
            </div>
            {[
              { icon: <Bell className="h-5 w-5" />, label: 'Notifications push', value: pushNotifications, onChange: setPushNotifications },
              { icon: <Volume2 className="h-5 w-5" />, label: 'Sons', value: soundNotifications, onChange: setSoundNotifications },
              { icon: <Vibrate className="h-5 w-5" />, label: 'Vibration proximité', value: proximityVibration, onChange: setProximityVibration },
            ].map((item, i) => (
              <div
                key={item.label}
                className={cn(
                  'flex items-center justify-between gap-4 px-4 py-3.5',
                  i < 2 && 'border-b border-white/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <Switch
                  checked={item.value}
                  onCheckedChange={(checked) => {
                    item.onChange(checked);
                    toast.success('Paramètre mis à jour');
                  }}
                />
              </div>
            ))}
          </motion.div>

          {/* Privacy & Data */}
          <motion.div
            className="glass rounded-xl overflow-hidden"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="px-4 py-3 border-b border-white/5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Confidentialité & Données
              </span>
            </div>
            <button
              onClick={() => navigate('/privacy-settings')}
              className="w-full flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors border-b border-white/5"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Vie privée</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={handleGDPRExport}
              className="w-full flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <span className="text-sm font-medium text-foreground">Export RGPD</span>
                  <p className="text-xs text-muted-foreground">Télécharge tes données au format JSON</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </motion.div>

          {/* Delete Account */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-[0.98] transition-all"
            >
              <Trash2 className="h-5 w-5" />
              <span className="font-bold text-sm">Supprimer mon compte</span>
            </button>
          </motion.div>

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-[10px] text-muted-foreground/50 font-medium">
              NEARVITY v2.0.0 — Made in France by EmotionsCare SASU
            </p>
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-[400px] mx-auto glass-strong rounded-2xl p-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Supprimer ton compte ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Cette action est irréversible. Toutes tes données, sessions et messages seront définitivement supprimés.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 rounded-xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 py-3 rounded-xl bg-destructive text-white font-bold text-sm hover:bg-destructive/90 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <BottomNav />
      </div>
    </PageLayout>
  );
}
