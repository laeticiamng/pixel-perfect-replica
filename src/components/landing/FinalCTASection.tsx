import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';

export function FinalCTASection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="py-20 px-6 relative z-10">
      <div className="max-w-3xl mx-auto text-center">
        <RevealText>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            <span className="text-muted-foreground">{t('landing.readyToConnect')}</span>
            <br />
            <span className="bg-gradient-to-r from-coral via-coral-light to-coral bg-clip-text text-transparent">
              {t('landing.connect')}
            </span>
          </h2>
        </RevealText>
        
        <RevealText delay={0.2}>
          <p className="text-lg text-muted-foreground mb-12 max-w-md mx-auto">
            {t('landing.joinRevolution')}
            <br />{t('landing.itsFreeNow')}
          </p>
        </RevealText>
        
        <RevealText delay={0.4}>
          <Button
            onClick={() => navigate('/onboarding')}
            size="lg"
            className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-white rounded-full shadow-xl hover:shadow-coral/30 transition-all duration-300 hover:scale-105"
          >
            {t('landing.startNow')}
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </RevealText>
      </div>
    </section>
  );
}
