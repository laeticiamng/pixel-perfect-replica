import { forwardRef, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';

export const FinalCTASection = forwardRef<HTMLElement>(function FinalCTASection(_props, ref) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  const borderOpacity = useTransform(scrollYProgress, [0.2, 0.7], [0, 1]);
  const glowScale = useTransform(scrollYProgress, [0.3, 0.8], [0.8, 1]);

  return (
    <section ref={(node) => {
      (sectionRef as React.MutableRefObject<HTMLElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    }} className="py-20 sm:py-24 px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        <RevealText>
          <motion.div
            className="relative rounded-3xl overflow-hidden"
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.4 }}
          >
            {/* Animated gradient border */}
            <motion.div
              style={{ opacity: borderOpacity }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-coral via-coral-light to-coral"
            />
            
            {/* Inner content */}
            <div className="relative m-[1.5px] rounded-3xl bg-card/95 backdrop-blur-xl p-8 sm:p-10 md:p-16 text-center overflow-hidden">
              {/* Top light line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-coral/50 to-transparent" />
              
              {/* Glow spots */}
              <motion.div
                style={{ scale: glowScale }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-40 bg-coral/10 blur-[80px] rounded-full pointer-events-none"
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-48 bg-coral/12 blur-[100px] rounded-full pointer-events-none" />
              
              <h2 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                <span className="text-muted-foreground">{t('landing.readyToConnect')}</span>
                <br />
                <span className="bg-gradient-to-r from-coral via-coral-light to-coral bg-clip-text text-transparent">
                  {t('landing.connect')}
                </span>
              </h2>
              
              <p className="relative text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-md mx-auto">
                {t('landing.joinRevolution')}
              </p>
              
              <motion.button
                onClick={() => navigate('/onboarding')}
                className="group relative h-14 sm:h-16 px-10 sm:px-12 text-lg sm:text-xl font-bold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-white rounded-full shadow-xl shadow-coral/25 hover:shadow-2xl hover:shadow-coral/40 transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative flex items-center gap-2">
                  {t('landing.createMyAccount')}
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>
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
