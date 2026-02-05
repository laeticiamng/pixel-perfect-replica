import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';
import { SignalDemo } from './SignalDemo';

export function AppPreviewSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        <RevealText>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('landing.appPreviewTitle')}</h2>
            <p className="text-muted-foreground">{t('landing.appPreviewDesc')}</p>
          </div>
        </RevealText>
        
        <RevealText delay={0.2}>
          <div className="relative mx-auto max-w-sm">
            {/* Phone mockup */}
            <div className="relative bg-card rounded-[3rem] p-3 border-4 border-muted shadow-2xl">
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-muted rounded-b-2xl z-20" />
              
              {/* Screen */}
              <div className="relative bg-background rounded-[2.5rem] overflow-hidden aspect-[9/16] flex flex-col items-center justify-center">
                {/* Status bar mock */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-background/50 to-transparent z-10" />
                
                {/* Radar content */}
                <div className="flex-1 flex items-center justify-center">
                  <SignalDemo />
                </div>
                
                {/* Bottom nav mock */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur border-t border-muted flex items-center justify-around px-4">
                  <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                    <span className="text-coral text-lg">📍</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-lg">📅</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-lg">👥</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-lg">👤</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -right-4 top-1/3 bg-coral text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg"
            >
              {t('landing.liveDemo')}
            </motion.div>
          </div>
        </RevealText>
      </div>
    </section>
  );
}
