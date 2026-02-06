import { Ban, CheckCircle, Shield } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';

export function GuaranteeSection() {
  const { t } = useTranslation();

  const guarantees = [
    { icon: Ban, title: t('landing.noVirtualChat'), desc: t('landing.meetInPerson'), borderColor: 'border-coral/20' },
    { icon: CheckCircle, title: t('landing.mutualConsent'), desc: t('landing.naturalApproach'), borderColor: 'border-signal-green/30' },
    { icon: Shield, title: t('landing.safetyFirst'), desc: t('landing.safetyDesc'), borderColor: 'border-signal-yellow/30' },
  ];

  return (
    <section className="py-16 px-6 relative z-10 bg-gradient-to-b from-transparent to-coral/5">
      <div className="max-w-4xl mx-auto">
        <RevealText>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-signal-green/50 mb-6">
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

        <div className="grid md:grid-cols-3 gap-6">
          {guarantees.map((item, i) => (
            <RevealText key={i} delay={i * 0.1}>
              <div className={`p-6 rounded-2xl glass border ${item.borderColor} text-center`}>
                <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-coral" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
}
