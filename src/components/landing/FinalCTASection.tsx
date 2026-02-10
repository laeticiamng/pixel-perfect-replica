import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';

export function FinalCTASection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="py-20 px-6 relative z-10 bg-gradient-to-b from-coral/5 to-coral/15 border-t border-coral/10">
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
            onClick={() => navigate('/app/radar')}
            size="lg"
            className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-violet to-violet-light hover:from-violet-dark hover:to-violet text-white rounded-full shadow-xl hover:shadow-violet/30 transition-all duration-300 hover:scale-105"
          >
            {t('landing.startNow')}
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </RevealText>
      </div>
    </section>
  );
}
