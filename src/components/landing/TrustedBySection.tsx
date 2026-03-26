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
    <section ref={ref} className="py-6 sm:py-8 px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        <RevealText>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {badges.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="group flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full border border-border/25 bg-card/25 backdrop-blur-xl hover:border-coral/25 hover:bg-card/40 transition-all duration-300"
              >
                <div className="w-5 h-5 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
                  <badge.icon className="h-3 w-3 text-coral" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground/80 whitespace-nowrap group-hover:text-foreground transition-colors">
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
