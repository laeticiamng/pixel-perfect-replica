import { forwardRef } from 'react';
import { BookOpen, Dumbbell, Coffee, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';
import { type LucideIcon } from 'lucide-react';

export const UseCasesSection = forwardRef<HTMLElement>(function UseCasesSection(_props, ref) {
  const { t } = useTranslation();

  const useCases: { icon: LucideIcon; place: string; action: string; gradient: string }[] = [
    { icon: BookOpen, place: t('landing.library'), action: t('landing.studyTogether'), gradient: 'from-blue-500/10 to-transparent' },
    { icon: Dumbbell, place: t('landing.gym'), action: t('landing.trainTogether'), gradient: 'from-green-500/10 to-transparent' },
    { icon: Coffee, place: t('landing.cafe'), action: t('landing.chat'), gradient: 'from-amber-500/10 to-transparent' },
    { icon: Laptop, place: t('landing.coworking'), action: t('landing.brainstorm'), gradient: 'from-purple-500/10 to-transparent' },
  ];

  return (
    <section ref={ref} className="pb-16 pt-0 px-6 relative z-10 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.map((item, i) => (
            <RevealText key={i} delay={i * 0.1}>
              <motion.div
                className="group relative p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md text-center hover:border-coral/30 transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.25 }}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Top shine */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral/15 to-coral/5 flex items-center justify-center mx-auto mb-3 border border-coral/10">
                    <item.icon className="h-6 w-6 text-coral" />
                  </div>
                  <p className="font-bold text-foreground">{item.place}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
                </div>
              </motion.div>
            </RevealText>
          ))}
        </div>

      </div>
    </section>
  );
});
