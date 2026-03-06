import { forwardRef } from 'react';
import { ShieldCheck, GraduationCap, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';

export const TrustedBySection = forwardRef<HTMLElement>(function TrustedBySection(_props, ref) {
  const { t } = useTranslation();

  const badges = [
    { icon: GraduationCap, label: t('landing.trustedStudents') },
    { icon: ShieldCheck, label: t('landing.trustedPrivacy') },
    { icon: Heart, label: t('landing.trustedMadeInFrance') },
  ];

  return (
    <section ref={ref} className="py-8 px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        <RevealText>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {badges.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm"
              >
                <badge.icon className="h-4 w-4 text-coral shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </RevealText>
      </div>
    </section>
  );
});
