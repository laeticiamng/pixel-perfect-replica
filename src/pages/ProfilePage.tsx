import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, ChevronRight, Award, BookOpen, Dumbbell, Coffee, MessageSquare, Zap, Shield, GraduationCap, Edit2 } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { PageLayout } from '@/components/PageLayout';
import { cn } from '@/lib/utils';

interface Badge {
  id: string;
  label: string;
  emoji: string;
  earned: boolean;
  description: string;
}

const MOCK_BADGES: Badge[] = [
  { id: 'first-session', label: 'Première session', emoji: '🌟', earned: true, description: 'Tu as fait ta première session !' },
  { id: 'social-butterfly', label: 'Papillon social', emoji: '🦋', earned: true, description: '10 sessions complétées' },
  { id: 'study-buddy', label: 'Binôme de choc', emoji: '📚', earned: true, description: '5 sessions de révision' },
  { id: 'early-bird', label: 'Lève-tôt', emoji: '🌅', earned: false, description: 'Session avant 8h' },
  { id: 'night-owl', label: 'Noctambule', emoji: '🦉', earned: false, description: 'Session après 22h' },
  { id: 'explorer', label: 'Explorateur', emoji: '🗺️', earned: true, description: '3 lieux différents' },
];

const MOCK_STATS = {
  sessions: 23,
  hoursActive: 18.5,
  rating: 4.8,
  peopleMet: 15,
  favoriteActivities: [
    { activity: 'Réviser', emoji: '📚', count: 12, icon: BookOpen },
    { activity: 'Sport', emoji: '🏃', count: 6, icon: Dumbbell },
    { activity: 'Manger', emoji: '🍽️', count: 3, icon: Coffee },
    { activity: 'Discuter', emoji: '💬', count: 2, icon: MessageSquare },
  ],
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [showAllBadges, setShowAllBadges] = useState(false);

  const displayedBadges = showAllBadges ? MOCK_BADGES : MOCK_BADGES.filter(b => b.earned);

  return (
    <PageLayout className="pb-28">
      <div className="max-w-[430px] mx-auto w-full">
        {/* Header */}
        <header className="safe-top px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Mon Profil</h1>
            <button
              onClick={() => navigate('/app/settings')}
              className="p-2.5 rounded-xl bg-card border border-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 mt-4"
        >
          <div className="glass-strong rounded-2xl p-6 shadow-medium relative overflow-hidden">
            {/* Glow background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet/10 rounded-full blur-3xl" />

            <div className="flex items-start gap-4 relative">
              {/* Avatar - small round thumbnail */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet to-violet-dark flex items-center justify-center glow-violet shadow-medium overflow-hidden">
                  <span className="text-2xl font-bold text-white">A</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">Alex</h2>
                  <button className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Sorbonne Université
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Étudiant en droit, passionné de sport et de café ☕
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-6 mt-4"
        >
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: MOCK_STATS.sessions, label: 'Sessions', color: 'text-violet' },
              { value: `${MOCK_STATS.hoursActive}h`, label: 'Actif', color: 'text-green-400' },
              { value: MOCK_STATS.rating.toFixed(1), label: 'Note', color: 'text-yellow-400' },
              { value: MOCK_STATS.peopleMet, label: 'Rencontres', color: 'text-orange-400' },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-xl p-3 text-center">
                <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Favorite Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-6 mt-6"
        >
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Activités préférées
          </h3>
          <div className="space-y-2">
            {MOCK_STATS.favoriteActivities.map((act, i) => (
              <div key={i} className="glass rounded-xl p-3 flex items-center gap-3">
                <span className="text-xl">{act.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{act.activity}</span>
                    <span className="text-xs text-muted-foreground">{act.count} sessions</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(act.count / MOCK_STATS.sessions) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                      className="h-full rounded-full bg-violet"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-6 mt-6"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" /> Badges
            </h3>
            <button
              onClick={() => setShowAllBadges(!showAllBadges)}
              className="text-xs text-violet font-medium"
            >
              {showAllBadges ? 'Masquer' : 'Tout voir'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {displayedBadges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className={cn(
                  'glass rounded-xl p-3 text-center transition-all',
                  badge.earned
                    ? 'border border-violet/20'
                    : 'opacity-40 grayscale'
                )}
              >
                <div className="text-2xl mb-1">{badge.emoji}</div>
                <p className="text-[10px] font-bold text-foreground leading-tight">{badge.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="px-6 mt-6 space-y-2"
        >
          {[
            { label: 'Modifier le profil', route: '/profile/edit' },
            { label: 'Personnes rencontrées', route: '/people-met' },
            { label: 'Paramètres', route: '/app/settings' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className="w-full flex items-center justify-between px-4 py-3.5 glass rounded-xl hover:bg-card/80 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </motion.div>

        {/* Footer */}
        <div className="px-6 py-6 text-center">
          <Link to="/changelog" className="text-[10px] text-muted-foreground/50 font-medium hover:text-violet transition-colors">
            NEARVITY v2.0.0 — Made in France by EmotionsCare SASU
          </Link>
        </div>

        <BottomNav />
      </div>
    </PageLayout>
  );
}
