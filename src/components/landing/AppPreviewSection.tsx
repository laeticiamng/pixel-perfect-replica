import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, Calendar, Users, User } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';
import { SignalDemo } from './SignalDemo';
import { useRef } from 'react';

export function AppPreviewSection() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const phoneY = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -30]);
  const phoneRotate = useTransform(scrollYProgress, [0, 0.5, 1], [3, 0, -2]);
  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 0.6]);

  return (
    <section ref={sectionRef} id="app-preview" className="py-16 sm:py-20 px-6 relative z-10 overflow-hidden scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <RevealText>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('landing.appPreviewTitle')}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">{t('landing.appPreviewDesc')}</p>
          </div>
        </RevealText>
        
        <RevealText delay={0.2}>
          <div className="relative mx-auto max-w-[280px] sm:max-w-sm">
            {/* Ambient glow behind phone */}
            <motion.div
              style={{ opacity: glowOpacity }}
              className="absolute -inset-10 bg-coral/15 rounded-full blur-[80px] pointer-events-none"
            />

            {/* Phone mockup with parallax */}
            <motion.div
              style={{ y: phoneY, rotateX: phoneRotate }}
              className="relative perspective-1000"
            >
              <div className="relative bg-card rounded-[2.5rem] sm:rounded-[3rem] p-2.5 sm:p-3 border-[3px] sm:border-4 border-muted/80 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]">
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-5 sm:h-6 bg-muted rounded-b-xl sm:rounded-b-2xl z-20" />
                
                {/* Screen */}
                <div className="relative bg-background rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden aspect-[9/16] flex flex-col items-center justify-center">
                  {/* Status bar mock */}
                  <div className="absolute top-0 left-0 right-0 h-8 sm:h-10 bg-gradient-to-b from-background/60 to-transparent z-10" />
                  
                  {/* Radar content */}
                  <div className="flex-1 flex items-center justify-center">
                    <SignalDemo />
                  </div>
                  
                  {/* Bottom nav mock */}
                  <div className="absolute bottom-0 left-0 right-0 h-14 sm:h-16 bg-card/80 backdrop-blur-lg border-t border-muted/50 flex items-center justify-around px-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-coral/20 flex items-center justify-center ring-2 ring-coral/10">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-coral" />
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted/50 flex items-center justify-center">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted/50 flex items-center justify-center">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted/50 flex items-center justify-center">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reflective surface below phone */}
              <div className="h-16 mt-1 bg-gradient-to-b from-muted/5 to-transparent rounded-b-3xl blur-sm opacity-40 mx-4" />
            </motion.div>
            
            {/* Floating label with pulse */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.5, type: 'spring' }}
              className="absolute right-0 sm:-right-4 top-1/3 z-20"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-coral rounded-full blur-md opacity-40 animate-pulse" />
                <div className="relative bg-coral text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-coral/30">
                  {t('landing.liveDemo')}
                </div>
              </div>
            </motion.div>
          </div>
        </RevealText>
      </div>
    </section>
  );
}
