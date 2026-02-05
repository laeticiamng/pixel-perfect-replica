import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';

export function GuaranteeSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-6 relative z-10 bg-gradient-to-b from-transparent to-coral/5">
      <div className="max-w-4xl mx-auto">
        <RevealText>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-signal-green/50 mb-6">
              <span className="text-2xl">🛡️</span>
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

        <div className="grid md:grid-cols-3 gap-6">
          <RevealText delay={0}>
            <div className="p-6 rounded-2xl glass border border-coral/20 text-center">
              <span className="text-4xl mb-4 block">🚫</span>
              <h3 className="font-bold text-foreground mb-2">{t('landing.noVirtualChat')}</h3>
              <p className="text-sm text-muted-foreground">{t('landing.meetInPerson')}</p>
            </div>
          </RevealText>
          <RevealText delay={0.1}>
            <div className="p-6 rounded-2xl glass border border-signal-green/30 text-center">
              <span className="text-4xl mb-4 block">✅</span>
              <h3 className="font-bold text-foreground mb-2">{t('landing.mutualConsent')}</h3>
              <p className="text-sm text-muted-foreground">{t('landing.naturalApproach')}</p>
            </div>
          </RevealText>
          <RevealText delay={0.2}>
            <div className="p-6 rounded-2xl glass border border-signal-yellow/30 text-center">
              <span className="text-4xl mb-4 block">🔒</span>
              <h3 className="font-bold text-foreground mb-2">{t('landing.safetyFirst')}</h3>
              <p className="text-sm text-muted-foreground">{t('landing.safetyDesc')}</p>
            </div>
          </RevealText>
        </div>
      </div>
    </section>
  );
}
