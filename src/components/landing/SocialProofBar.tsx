import { Users, Zap, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

export function SocialProofBar() {
  const { t } = useTranslation();

  const stats = [
    { icon: Users, value: '500+', label: t('landing.socialProofUsers') },
    { icon: Zap, value: '1 200+', label: t('landing.socialProofSessions') },
    { icon: MapPin, value: '15+', label: t('landing.socialProofCities') },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-8 px-6 relative z-10"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-6 md:gap-12 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl py-4 px-6">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-6 md:gap-12">
              {i > 0 && <div className="w-px h-8 bg-border/50" />}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <stat.icon className="h-4 w-4 text-coral" />
                  <span className="text-2xl md:text-3xl font-extrabold text-foreground">{stat.value}</span>
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
