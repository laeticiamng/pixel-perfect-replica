import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Check, Loader2, Radio, Shield, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/PageLayout';
import { ActivitySelector } from '@/components/radar/ActivitySelector';
import { useLocationStore } from '@/stores/locationStore';
import { useSignalStore } from '@/stores/signalStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { ActivityType } from '@/types/signal';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3;

export default function PostSignupOnboardingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [step, setStep] = useState<Step>(1);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const { startWatching, position, error: locationError } = useLocationStore();
  const { activateSignal } = useSignalStore();
  const { setHasSeenLocationPrompt } = useSettingsStore();

  // Watch for position changes
  useEffect(() => {
    if (position && locationStatus === 'loading') {
      if (locationError) {
        setLocationStatus('error');
      } else {
        setLocationStatus('success');
        toast.success(t('onboarding.locationObtained') + ' !');
        // Auto-advance after success
        setTimeout(() => setStep(2), 1000);
      }
    }
  }, [position, locationStatus, locationError, t]);

  // Watch for location errors
  useEffect(() => {
    if (locationError && !position && locationStatus === 'loading') {
      setLocationStatus('error');
      toast.error(locationError);
    }
  }, [locationError, position, locationStatus]);

  const handleLocationRequest = () => {
    setLocationStatus('loading');
    setHasSeenLocationPrompt(true);
    startWatching();
  };

  const handleSkipLocation = () => {
    setHasSeenLocationPrompt(true);
    setStep(2);
  };

  const handleActivitySelect = (activity: ActivityType) => {
    setSelectedActivity(activity);
  };

  const handleContinueToSignal = () => {
    if (selectedActivity) {
      setStep(3);
    }
  };

  const handleActivateSignal = async () => {
    if (!selectedActivity) return;
    
    setIsActivating(true);
    
    // Animate the activation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    activateSignal(selectedActivity);
    toast.success(t('postOnboarding.signalActivated'));
    
    // Navigate to map after a brief celebration
    setTimeout(() => {
      navigate('/map');
    }, 500);
  };

  const handleSkipToMap = () => {
    navigate('/map');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center justify-center px-6 text-center"
          >
            {/* Animated icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 rounded-full bg-coral/20 blur-xl animate-breathing" />
              <div className={cn(
                "w-28 h-28 rounded-full flex items-center justify-center relative shadow-xl transition-all duration-500",
                locationStatus === 'success' 
                  ? "bg-gradient-to-br from-signal-green to-signal-green/80"
                  : "bg-gradient-to-br from-coral to-coral-dark"
              )}>
                {locationStatus === 'success' ? (
                  <Check className="h-14 w-14 text-white" />
                ) : locationStatus === 'loading' ? (
                  <Loader2 className="h-14 w-14 text-white animate-spin" />
                ) : (
                  <MapPin className="h-14 w-14 text-white" />
                )}
              </div>
              {/* Ripple effect */}
              {locationStatus !== 'success' && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-coral/40 animate-ripple" />
                  <div className="absolute inset-0 rounded-full border-2 border-coral/20 animate-ripple" style={{ animationDelay: '0.5s' }} />
                </>
              )}
            </motion.div>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground mb-3"
            >
              {t('postOnboarding.step1Title')}
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mb-8 max-w-sm"
            >
              {t('postOnboarding.step1Desc')}
            </motion.p>
            
            {/* Privacy guarantees */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 mb-8 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-signal-green/10 border border-signal-green/20">
                <Shield className="h-5 w-5 text-signal-green flex-shrink-0" />
                <span className="text-sm text-foreground text-left">{t('map.privacyGuarantee1')}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-signal-green/10 border border-signal-green/20">
                <Eye className="h-5 w-5 text-signal-green flex-shrink-0" />
                <span className="text-sm text-foreground text-left">{t('map.privacyGuarantee2')}</span>
              </div>
            </motion.div>
            
            {/* Action buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="w-full max-w-sm space-y-3"
            >
              <Button
                onClick={handleLocationRequest}
                disabled={locationStatus === 'loading' || locationStatus === 'success'}
                className={cn(
                  "w-full h-14 rounded-xl text-lg font-semibold transition-all",
                  locationStatus === 'success'
                    ? "bg-signal-green hover:bg-signal-green text-primary-foreground"
                    : "bg-coral hover:bg-coral-dark text-primary-foreground glow-coral"
                )}
              >
                {locationStatus === 'success' ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    {t('onboarding.locationObtained')}
                  </>
                ) : locationStatus === 'loading' ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t('onboarding.locating')}
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 mr-2" />
                    {t('postOnboarding.allowLocation')}
                  </>
                )}
              </Button>
              
              {locationStatus !== 'success' && (
                <Button
                  onClick={handleSkipLocation}
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  {t('postOnboarding.skipForNow')}
                </Button>
              )}
            </motion.div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col px-6"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8"
            >
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('postOnboarding.step2Title')}
              </h2>
              <p className="text-muted-foreground">
                {t('postOnboarding.step2Desc')}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              <ActivitySelector
                selectedActivity={selectedActivity}
                onSelect={handleActivitySelect}
              />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 space-y-3"
            >
              <Button
                onClick={handleContinueToSignal}
                disabled={!selectedActivity}
                className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold glow-coral disabled:opacity-50 disabled:glow-none"
              >
                {t('continue')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button
                onClick={handleSkipToMap}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
              >
                {t('postOnboarding.explorFirst')}
              </Button>
            </motion.div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center justify-center px-6 text-center"
          >
            {/* Big signal button */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
              className="relative mb-8"
            >
              {/* Outer glow rings */}
              <motion.div
                animate={{ 
                  scale: isActivating ? [1, 1.5, 1] : [1, 1.2, 1],
                  opacity: isActivating ? [0.5, 0, 0.5] : [0.3, 0.1, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-signal-green/30 blur-xl"
                style={{ transform: 'scale(1.5)' }}
              />
              
              <motion.button
                onClick={handleActivateSignal}
                disabled={isActivating}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl",
                  isActivating 
                    ? "bg-gradient-to-br from-signal-green to-signal-green/80 glow-green"
                    : "bg-gradient-to-br from-coral to-coral-dark glow-coral hover:shadow-coral/50"
                )}
              >
                {isActivating ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <Check className="h-16 w-16 text-white" />
                  </motion.div>
                ) : (
                  <>
                    <Radio className="h-12 w-12 text-white mb-2" />
                    <span className="text-white font-bold text-sm">{t('postOnboarding.tapToActivate')}</span>
                  </>
                )}
              </motion.button>
              
              {/* Pulsing rings */}
              {!isActivating && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-4 border-coral"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-0 rounded-full border-4 border-coral"
                  />
                </>
              )}
            </motion.div>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground mb-3"
            >
              {isActivating ? t('postOnboarding.signalActivated') : t('postOnboarding.step3Title')}
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mb-4 max-w-sm"
            >
              {isActivating 
                ? t('postOnboarding.redirecting')
                : t('postOnboarding.step3Desc')
              }
            </motion.p>
            
            {!isActivating && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 text-sm text-signal-green bg-signal-green/10 px-4 py-2 rounded-full"
              >
                <Zap className="h-4 w-4" />
                <span>{selectedActivity && t(`activities.${selectedActivity}`)}</span>
              </motion.div>
            )}
            
            {!isActivating && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8"
              >
                <Button
                  onClick={handleSkipToMap}
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t('postOnboarding.explorFirst')}
                </Button>
              </motion.div>
            )}
          </motion.div>
        );
    }
  };

  const totalSteps = 3;

  return (
    <PageLayout showSidebar={false} className="flex flex-col min-h-[100dvh]">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full py-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6 px-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: s * 0.1 }}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                s === step ? 'w-8 bg-coral' : s < step ? 'w-2 bg-signal-green' : 'w-2 bg-muted'
              )}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
