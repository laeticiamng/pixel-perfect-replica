import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';

export function UseCasesSection() {
  const { t } = useTranslation();

  const useCases = [
    { emoji: '📚', place: t('landing.library'), action: t('landing.studyTogether') },
    { emoji: '🏋️', place: t('landing.gym'), action: t('landing.trainTogether') },
    { emoji: '☕', place: t('landing.cafe'), action: t('landing.chat') },
    { emoji: '💻', place: t('landing.coworking'), action: t('landing.brainstorm') },
  ];

  return (
    <section className="py-12 px-6 relative z-10 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <RevealText>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            {t('landing.worksEverywhere')}
          </h2>
        </RevealText>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.map((item, i) => (
            <RevealText key={i} delay={i * 0.1}>
              <div className="p-6 rounded-2xl glass text-center hover:border-coral/30 border border-transparent transition-all duration-300">
                <span className="text-4xl mb-3 block">{item.emoji}</span>
                <p className="font-bold text-foreground">{item.place}</p>
                <p className="text-sm text-muted-foreground">{item.action}</p>
              </div>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
}
