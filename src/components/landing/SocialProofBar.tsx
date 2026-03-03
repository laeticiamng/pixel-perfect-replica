import { Users, Zap, MapPin } from 'lucide-react';
import { motion, useInView, animate } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { useRef, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView || value === 0) return;
    const controls = animate(0, value, {
      duration: 1.5,
      ease: [0.25, 0.4, 0.25, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-2xl md:text-3xl font-extrabold text-foreground tabular-nums">
      {display}{suffix}
    </span>
  );
}

export function SocialProofBar() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<{ active_users_now: number; sessions_this_month: number; completed_sessions: number } | null>(null);
  const hasTracked = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true });

  useEffect(() => {
    supabase.rpc('get_community_stats').then(({ data }) => {
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    });
  }, []);

  // Track view
  useEffect(() => {
    if (isInView && !hasTracked.current) {
      hasTracked.current = true;
      supabase.from('analytics_events' as any).insert({
        event_name: 'social_proof_view',
        event_category: 'engagement',
        event_data: { stats },
        page_path: '/',
        session_id: sessionStorage.getItem('analytics_session_id'),
      }).then(() => {});
    }
  }, [isInView, stats]);

  const displayStats = [
    { icon: Users, value: stats?.active_users_now ?? 0, suffix: '', label: t('landing.socialProofUsers') },
    { icon: Zap, value: stats?.sessions_this_month ?? 0, suffix: '', label: t('landing.socialProofSessions') },
    { icon: MapPin, value: stats?.completed_sessions ?? 0, suffix: '+', label: t('landing.socialProofCompleted') },
  ];

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-8 px-6 relative z-10"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl py-4 px-6">
          {displayStats.map((stat, i) => (
            <div key={i} className="flex items-center">
              {i > 0 && <div className="w-px h-8 bg-border/50 mx-4 md:mx-6" />}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <stat.icon className="h-4 w-4 text-coral" />
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
