import { forwardRef } from 'react';
import { BookOpen, Dumbbell, Coffee, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';
import { type LucideIcon } from 'lucide-react';

export const UseCasesSection = forwardRef<HTMLElement>(function UseCasesSection(_props, ref) {
  const { t } = useTranslation();

  const useCases: { icon: LucideIcon; place: string; action: string; accentColor: string; glowColor: string }[] = [
    { icon: BookOpen, place: t('landing.library'), action: t('landing.studyTogether'), accentColor: 'from-blue-400/15 to-blue-400/5', glowColor: 'group-hover:shadow-blue-400/10' },
    { icon: Dumbbell, place: t('landing.gym'), action: t('landing.trainTogether'), accentColor: 'from-emerald-400/15 to-emerald-400/5', glowColor: 'group-hover:shadow-emerald-400/10' },
    { icon: Coffee, place: t('landing.cafe'), action: t('landing.chat'), accentColor: 'from-amber-400/15 to-amber-400/5', glowColor: 'group-hover:shadow-amber-400/10' },
    { icon: Laptop, place: t('landing.coworking'), action: t('landing.brainstorm'), accentColor: 'from-violet-400/15 to-violet-400/5', glowColor: 'group-hover:shadow-violet-400/10' },
  ];

  return (
    <section ref={ref} className="pb-14 sm:pb-16 pt-0 px-6 relative z-10 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {useCases.map((item, i) => (
            <RevealText key={i} delay={i * 0.08}>
              <motion.div
                className={`group relative p-5 sm:p-6 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-xl text-center hover:border-coral/25 hover:bg-card/50 transition-all duration-400 overflow-hidden ${item.glowColor} hover:shadow-lg`}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Top shine */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-coral/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${item.accentColor} flex items-center justify-center mx-auto mb-3 border border-coral/10 group-hover:border-coral/25 transition-all duration-500`}>
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-coral transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <p className="font-bold text-foreground text-sm sm:text-base">{item.place}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{item.action}</p>
                </div>
              </motion.div>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
});
