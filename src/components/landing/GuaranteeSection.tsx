import { forwardRef } from 'react';
import { Ban, CheckCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';

export const GuaranteeSection = forwardRef<HTMLElement>(function GuaranteeSection(_props, ref) {
  const { t } = useTranslation();

  const guarantees = [
    { icon: Ban, title: t('landing.noVirtualChat'), desc: t('landing.meetInPerson'), color: 'signal-green' },
    { icon: CheckCircle, title: t('landing.guaranteeMutualConsent'), desc: t('landing.guaranteeMutualConsentDesc'), color: 'signal-green' },
    { icon: Shield, title: t('landing.safetyFirst'), desc: t('landing.safetyDesc'), color: 'signal-green' },
  ];

  return (
    <section ref={ref} className="py-14 sm:py-16 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        <RevealText>
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-signal-green/20 bg-signal-green/5 backdrop-blur-xl mb-5">
              <Shield className="h-4 w-4 text-signal-green" />
              <span className="text-xs sm:text-sm font-semibold text-signal-green">{t('landing.realMeetingsGuarantee')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              {t('landing.notADatingApp')}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              {t('landing.forRealConnections')}
            </p>
          </div>
        </RevealText>

        <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
          {guarantees.map((item, i) => (
            <RevealText key={i} delay={i * 0.1}>
              <motion.div
                className="group relative p-5 sm:p-6 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-xl text-center overflow-hidden hover:border-signal-green/25 hover:bg-card/50 transition-all duration-400"
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                {/* Top shine */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-signal-green/15 to-transparent" />
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-signal-green/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-signal-green/15 to-signal-green/5 flex items-center justify-center mx-auto mb-4 border border-signal-green/10 group-hover:border-signal-green/25 group-hover:shadow-lg group-hover:shadow-signal-green/10 transition-all duration-500">
                    <item.icon className="h-6 w-6 sm:h-7 sm:w-7 text-signal-green transition-transform duration-500 group-hover:scale-110" />
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
