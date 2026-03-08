import { forwardRef } from 'react';
import { ShieldCheck, GraduationCap, Heart, Globe, Lock } from 'lucide-react';
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
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {badges.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-full border border-border/40 bg-card/40 backdrop-blur-md hover:border-coral/30 transition-all duration-300"
              >
                <badge.icon className="h-4 w-4 text-coral shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap group-hover:text-foreground transition-colors">
                  {badge.label}
                </span>
              </motion.div>
            ))}
          </div>
        </RevealText>
      </div>
    </section>
  );
});
