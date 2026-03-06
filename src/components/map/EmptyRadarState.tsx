import { Radio, Share2, Users, Calendar, Trophy, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

interface EmptyRadarStateProps {
  onActivateSignal: () => void;
}

interface CommunityStats {
  active_users_now: number;
  sessions_this_month: number;
  completed_sessions: number;
}

export function EmptyRadarState({ onActivateSignal }: EmptyRadarStateProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [stats, setStats] = useState<CommunityStats | null>(null);

  useEffect(() => {
    supabase.rpc('get_community_stats').then(({ data }) => {
      if (data && data.length > 0) setStats(data[0]);
    });
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('share.title'),
          text: t('share.text'),
          url: window.location.origin,
        });
      } catch (err) {
        // Share dialog was cancelled by the user — no action needed
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      {/* Animated radar visualization */}
      <div className="relative w-48 h-48 mb-8">
        {/* Radar circles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 rounded-full border border-muted/30" />
          <div className="absolute inset-[25%] rounded-full border border-muted/40" />
          <div className="absolute inset-[50%] rounded-full border border-muted/50" />
        </motion.div>
        
        {/* Radar sweep */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          <div 
            className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--coral) / 0.6), transparent)',
            }}
          />
          {/* Sweep trail */}
          <div 
            className="absolute top-1/2 left-1/2 w-1/2 h-full origin-left -rotate-30"
            style={{
              background: 'conic-gradient(from 0deg, transparent, hsl(var(--coral) / 0.1) 30deg, transparent 60deg)',
              clipPath: 'polygon(0 50%, 100% 0, 100% 100%)',
            }}
          />
        </motion.div>
        
        {/* Center dot - You */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-8 h-8 rounded-full bg-coral flex items-center justify-center shadow-lg glow-coral">
            <span className="text-white font-bold text-sm">{profile?.first_name?.charAt(0).toUpperCase() || '?'}</span>
          </div>
        </motion.div>
        
        {/* Pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-coral/50"
        />
      </div>
      
      {/* Message */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-4"
      >
        <h3 className="text-xl font-bold text-foreground mb-2">
          {t('map.noOneAround')}
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          {t('map.beTheFirst')}
        </p>
      </motion.div>

      {/* Community stats - social proof */}
      {stats && (stats.active_users_now > 0 || stats.sessions_this_month > 0) && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex items-center gap-4 mb-6 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50"
        >
          {stats.active_users_now > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-signal-green" />
              <span className="font-semibold text-foreground">{stats.active_users_now}</span>
              <span>{t('emptyState.activeNow')}</span>
            </div>
          )}
          {stats.sessions_this_month > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-coral" />
              <span className="font-semibold text-foreground">{stats.sessions_this_month}</span>
              <span>{t('emptyState.thisMonth')}</span>
            </div>
          )}
          {stats.completed_sessions > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Trophy className="h-3.5 w-3.5 text-signal-yellow" />
              <span className="font-semibold text-foreground">{stats.completed_sessions}</span>
              <span>{t('emptyState.completed')}</span>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Button
          onClick={onActivateSignal}
          className="h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl font-semibold glow-coral"
        >
          <Radio className="h-5 w-5 mr-2" />
          {t('map.activateMySignal')}
        </Button>
        
        <Button
          onClick={handleShare}
          variant="outline"
          className="h-12 rounded-xl border-2"
        >
          <Share2 className="h-4 w-4 mr-2" />
          {t('map.inviteFriends')}
        </Button>
      </motion.div>
    </div>
  );
}
