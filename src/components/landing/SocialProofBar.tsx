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
        <div className="flex items-center justify-center gap-8 md:gap-16">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-coral" />
                <span className="text-2xl md:text-3xl font-extrabold text-foreground">{stat.value}</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
