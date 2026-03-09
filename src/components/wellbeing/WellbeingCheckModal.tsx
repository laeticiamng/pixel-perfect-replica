import { useState } from 'react';
import { Heart, MessageCircle, Users, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface WellbeingCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCORE_LABELS = {
  en: ['Very low', 'Low', 'Moderate', 'Good', 'Excellent'],
  fr: ['Très faible', 'Faible', 'Moyen', 'Bien', 'Excellent'],
  de: ['Sehr niedrig', 'Niedrig', 'Mittel', 'Gut', 'Ausgezeichnet'],
};

export function WellbeingCheckModal({ isOpen, onClose }: WellbeingCheckModalProps) {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const [step, setStep] = useState(0);
  const [loneliness, setLoneliness] = useState<number | null>(null);
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [wantsMentor, setWantsMentor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResources, setShowResources] = useState(false);

  if (!isOpen) return null;

  const labels = SCORE_LABELS[locale as keyof typeof SCORE_LABELS] || SCORE_LABELS.en;

  const handleSubmit = async () => {
    if (!user || loneliness === null || satisfaction === null) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('wellbeing_checks').insert({
      user_id: user.id,
      loneliness_score: loneliness,
      social_satisfaction: satisfaction,
      wants_mentor: wantsMentor,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(t('wellbeing.submitError'));
      return;
    }

    // If concerning scores, show resources
    if (loneliness >= 4 || satisfaction <= 2 || wantsMentor) {
      setShowResources(true);
    } else {
      toast.success(t('wellbeing.thankYou'));
      onClose();
    }
  };

  const ScoreSelector = ({ 
    value, 
    onChange, 
    lowLabel, 
    highLabel 
  }: { 
    value: number | null; 
    onChange: (v: number) => void;
    lowLabel: string;
    highLabel: string;
  }) => (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map(score => (
          <button
            key={score}
            onClick={() => onChange(score)}
            className={cn(
              "w-12 h-12 rounded-xl text-lg font-bold transition-all",
              value === score
                ? "bg-coral text-primary-foreground scale-110 shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );

  if (showResources) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Heart className="h-5 w-5 text-coral" />
              {t('wellbeing.resourcesTitle')}
            </h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground">{t('wellbeing.resourcesIntro')}</p>

          <div className="space-y-3">
            <a href="https://www.esn.org/mental-health" target="_blank" rel="noopener noreferrer" 
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <ExternalLink className="h-4 w-4 text-coral shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">ESN Mental Health</p>
                <p className="text-xs text-muted-foreground">{t('wellbeing.esnDesc')}</p>
              </div>
            </a>
            <a href="https://www.befrienders.org" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <ExternalLink className="h-4 w-4 text-coral shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Befrienders Worldwide</p>
                <p className="text-xs text-muted-foreground">{t('wellbeing.befriendersDesc')}</p>
              </div>
            </a>
          </div>

          {wantsMentor && (
            <div className="p-3 rounded-xl bg-signal-green/10 border border-signal-green/20">
              <p className="text-sm text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-signal-green" />
                {t('wellbeing.mentorConfirm')}
              </p>
            </div>
          )}

          <Button onClick={onClose} className="w-full bg-coral hover:bg-coral-dark">
            {t('close')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-coral" />
            {t('wellbeing.title')}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">{t('wellbeing.subtitle')}</p>

        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">{t('wellbeing.q1')}</p>
            <ScoreSelector
              value={loneliness}
              onChange={(v) => { setLoneliness(v); setStep(1); }}
              lowLabel={t('wellbeing.notAtAll')}
              highLabel={t('wellbeing.veryMuch')}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">{t('wellbeing.q2')}</p>
            <ScoreSelector
              value={satisfaction}
              onChange={(v) => { setSatisfaction(v); setStep(2); }}
              lowLabel={t('wellbeing.veryUnsatisfied')}
              highLabel={t('wellbeing.verySatisfied')}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">{t('wellbeing.q3')}</p>
            <div className="flex gap-3">
              <Button
                variant={wantsMentor ? 'default' : 'outline'}
                onClick={() => setWantsMentor(true)}
                className={cn("flex-1", wantsMentor && "bg-coral hover:bg-coral-dark")}
              >
                {t('yes')}
              </Button>
              <Button
                variant={!wantsMentor ? 'default' : 'outline'}
                onClick={() => setWantsMentor(false)}
                className={cn("flex-1", !wantsMentor && "bg-muted text-foreground hover:bg-muted/80")}
              >
                {t('no')}
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-coral hover:bg-coral-dark mt-2"
            >
              {isSubmitting ? t('loading') : t('save')}
            </Button>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                step >= i ? "bg-coral" : "bg-muted"
              )}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
