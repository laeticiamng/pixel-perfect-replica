import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';

export const FinalCTASection = forwardRef<HTMLElement>(function FinalCTASection(_props, ref) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section ref={ref} className="py-24 px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        {/* Glowing border card - 21st.dev style */}
        <RevealText>
          <motion.div
            className="relative rounded-3xl overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-coral via-coral-light to-coral animate-gradient-shift" />
            
            {/* Inner content */}
            <div className="relative m-[1.5px] rounded-3xl bg-card/95 backdrop-blur-xl p-10 md:p-16 text-center">
              {/* Glow spots */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-coral/50 to-transparent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-32 bg-coral/10 blur-[60px] rounded-full" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-40 bg-coral/15 blur-[80px] rounded-full" />
              
              <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                <span className="text-muted-foreground">{t('landing.readyToConnect')}</span>
                <br />
                <span className="bg-gradient-to-r from-coral via-coral-light to-coral bg-clip-text text-transparent">
                  {t('landing.connect')}
                </span>
              </h2>
              
              <p className="relative text-lg text-muted-foreground mb-10 max-w-md mx-auto">
                {t('landing.joinRevolution')}
              </p>
              
              <Button
                onClick={() => navigate('/onboarding')}
                size="lg"
                className="group relative h-16 px-12 text-xl font-bold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-white rounded-full shadow-xl shadow-coral/25 hover:shadow-coral/40 transition-all duration-300 hover:scale-105"
              >
                {t('landing.createMyAccount')}
                <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Button>
              <p className="relative text-sm text-muted-foreground mt-4">
                {t('landing.itsFreeNow')}
              </p>
            </div>
          </motion.div>
        </RevealText>
      </div>
    </section>
  );
});
