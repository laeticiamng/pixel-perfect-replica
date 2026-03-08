import { forwardRef } from 'react';
import { Ban, CheckCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';

export const GuaranteeSection = forwardRef<HTMLElement>(function GuaranteeSection(_props, ref) {
  const { t } = useTranslation();

  const guarantees = [
    { icon: Ban, title: t('landing.noVirtualChat'), desc: t('landing.meetInPerson') },
    { icon: CheckCircle, title: t('landing.guaranteeMutualConsent'), desc: t('landing.guaranteeMutualConsentDesc') },
    { icon: Shield, title: t('landing.safetyFirst'), desc: t('landing.safetyDesc') },
  ];

  return (
    <section ref={ref} className="py-16 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        <RevealText>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-signal-green/30 bg-signal-green/5 backdrop-blur-md mb-6">
              <Shield className="h-5 w-5 text-signal-green" />
              <span className="text-sm font-semibold text-signal-green">{t('landing.realMeetingsGuarantee')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('landing.notADatingApp')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t('landing.forRealConnections')}
            </p>
          </div>
        </RevealText>

        <div className="grid md:grid-cols-3 gap-4">
          {guarantees.map((item, i) => (
            <RevealText key={i} delay={i * 0.1}>
              <motion.div 
                className="group relative p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md text-center overflow-hidden hover:border-coral/20 transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                {/* Top shine */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral/15 to-coral/5 flex items-center justify-center mx-auto mb-4 border border-coral/10">
                    <item.icon className="h-7 w-7 text-coral" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
});
