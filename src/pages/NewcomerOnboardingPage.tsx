import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plane, MapPin, Users, CheckCircle2, Loader2, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { PageLayout } from '@/components/PageLayout';
import { CityGuidesPanel } from '@/components/erasmus/CityGuidesPanel';
import { FirstWeekChecklist } from '@/components/erasmus/FirstWeekChecklist';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type NewcomerStep = 'welcome' | 'city' | 'guides' | 'checklist';

export default function NewcomerOnboardingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [step, setStep] = useState<NewcomerStep>('welcome');
  const [city, setCity] = useState('');
  const [wantsToBeGuide, setWantsToBeGuide] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewcomer, setIsNewcomer] = useState(true);

  const handleSetNewcomer = async () => {
    if (!user) return;
    if (isNewcomer && !city.trim()) {
      toast.error(t('erasmus.enterCity'));
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        is_newcomer: isNewcomer,
        arrival_city: isNewcomer ? city.trim() : null,
        arrival_date: isNewcomer ? new Date().toISOString().split('T')[0] : null,
        is_city_guide: !isNewcomer && wantsToBeGuide,
      })
      .eq('id', user.id);

    setIsSaving(false);

    if (error) {
      toast.error(t('erasmus.saveError'));
      return;
    }

    if (isNewcomer) {
      setStep('guides');
    } else if (wantsToBeGuide) {
      toast.success(t('erasmus.guideRegistered'));
      navigate('/map');
    } else {
      navigate('/map');
    }
  };

  const stepIndex = { welcome: 0, city: 1, guides: 2, checklist: 3 };
  const totalSteps = 4;

  return (
    <PageLayout showSidebar={false} className="flex flex-col min-h-[100dvh]">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full py-6">
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-6 px-6">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === stepIndex[step] ? 'w-8 bg-coral' : i < stepIndex[step] ? 'w-2 bg-signal-green' : 'w-2 bg-muted'
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 rounded-full bg-coral/20 blur-xl animate-breathing" />
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center relative shadow-xl">
                  <Plane className="h-14 w-14 text-white" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-foreground mb-3"
              >
                {t('erasmus.welcomeTitle')}
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-8 max-w-sm"
              >
                {t('erasmus.welcomeDesc')}
              </motion.p>

              {/* Choice: Newcomer or Local */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-sm space-y-3"
              >
                <button
                  onClick={() => { setIsNewcomer(true); setStep('city'); }}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02]',
                    'border-coral/30 bg-coral/5 hover:border-coral'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                      <Plane className="h-5 w-5 text-coral" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{t('erasmus.imNewHere')}</p>
                      <p className="text-xs text-muted-foreground">{t('erasmus.imNewHereDesc')}</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setIsNewcomer(false); setStep('city'); }}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02]',
                    'border-signal-green/30 bg-signal-green/5 hover:border-signal-green'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-signal-green/20 flex items-center justify-center">
                      <Globe2 className="h-5 w-5 text-signal-green" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{t('erasmus.imLocal')}</p>
                      <p className="text-xs text-muted-foreground">{t('erasmus.imLocalDesc')}</p>
                    </div>
                  </div>
                </button>

                <Button
                  onClick={() => navigate('/welcome')}
                  variant="ghost"
                  className="w-full text-muted-foreground"
                >
                  {t('skip')}
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: City input */}
          {step === 'city' && (
            <motion.div
              key="city"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col items-center justify-center px-6"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-coral/20 flex items-center justify-center mb-6"
              >
                <MapPin className="h-10 w-10 text-coral" />
              </motion.div>

              <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
                {isNewcomer ? t('erasmus.whereAreYou') : t('erasmus.whereDoYouStudy')}
              </h2>
              <p className="text-muted-foreground mb-6 text-center text-sm">
                {isNewcomer ? t('erasmus.cityHelpNewcomer') : t('erasmus.cityHelpLocal')}
              </p>

              <div className="w-full max-w-sm space-y-6">
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('erasmus.cityPlaceholder')}
                  className="h-14 bg-muted border-border text-foreground rounded-xl text-center text-lg"
                  autoFocus
                />

                {!isNewcomer && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-signal-green/5 border border-signal-green/20">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-signal-green" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{t('erasmus.becomeGuide')}</p>
                        <p className="text-xs text-muted-foreground">{t('erasmus.becomeGuideDesc')}</p>
                      </div>
                    </div>
                    <Switch checked={wantsToBeGuide} onCheckedChange={setWantsToBeGuide} />
                  </div>
                )}

                <Button
                  onClick={handleSetNewcomer}
                  disabled={isSaving || (isNewcomer && !city.trim())}
                  className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold glow-coral"
                >
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {t('continue')}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: City Guides */}
          {step === 'guides' && (
            <motion.div
              key="guides"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col px-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-8 w-8 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{t('erasmus.meetYourGuides')}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('erasmus.meetYourGuidesDesc', { city })}
                </p>
              </div>

              <div className="flex-1 overflow-auto">
                <CityGuidesPanel city={city} />
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => setStep('checklist')}
                  className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold"
                >
                  {t('erasmus.viewChecklist')}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate('/map')}
                  variant="ghost"
                  className="w-full text-muted-foreground"
                >
                  {t('erasmus.skipToMap')}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: First Week Checklist */}
          {step === 'checklist' && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col px-6"
            >
              <div className="flex-1 overflow-auto pb-4">
                <FirstWeekChecklist city={city} />
              </div>

              <div className="mt-4 space-y-3">
                <Button
                  onClick={() => navigate('/map')}
                  className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold glow-coral"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  {t('erasmus.startExploring')}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {t('erasmus.checklistAvailableLater')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
