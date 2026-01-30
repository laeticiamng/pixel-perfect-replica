import { useState, useEffect } from 'react';
import { X, Calendar, Users, MapPin, MessageCircle, CheckCircle2, Star, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface BinomeOnboardingProps {
  onComplete: () => void;
  forceShow?: boolean;
}

const ONBOARDING_KEY = 'binome_onboarding_completed';

const steps = [
  {
    icon: <Calendar className="h-8 w-8 text-coral" />,
    title: "Crée ou rejoins un créneau",
    description: "Planifie une session de 45min, 1h30 ou 3h dans ta ville. Choisis l'activité qui te correspond : étudier, manger, sport..."
  },
  {
    icon: <Users className="h-8 w-8 text-signal-green" />,
    title: "Trouve ton binôme",
    description: "D'autres utilisateurs peuvent rejoindre ton créneau. Maximum 4 participants par session pour garder une ambiance conviviale."
  },
  {
    icon: <MapPin className="h-8 w-8 text-primary" />,
    title: "Check-in sur place",
    description: "Le jour J, confirme ta présence en arrivant sur le lieu (à moins de 200m). Tu as 15 minutes avant et après l'heure prévue."
  },
  {
    icon: <MessageCircle className="h-8 w-8 text-coral" />,
    title: "Discute et organise",
    description: "Utilise le chat intégré pour coordonner les détails avec ton binôme : point de rencontre exact, changements de dernière minute..."
  },
  {
    icon: <Star className="h-8 w-8 text-yellow-500" />,
    title: "Laisse un feedback",
    description: "Après la session, évalue ton expérience. Les feedbacks positifs améliorent ton score de fiabilité et ta visibilité !"
  }
];

const features = [
  { icon: <Clock className="h-5 w-5" />, label: "Rappels automatiques", description: "1h et 15min avant" },
  { icon: <CheckCircle2 className="h-5 w-5" />, label: "Score de fiabilité", description: "Ponctualité récompensée" },
  { icon: <Sparkles className="h-5 w-5" />, label: "4 créneaux/mois gratuits", description: "Illimité en Premium" },
];

export function BinomeOnboarding({ onComplete, forceShow = false }: BinomeOnboardingProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has already seen onboarding
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompleted || forceShow) {
      setShowDialog(true);
    }
  }, [forceShow]);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowDialog(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowDialog(false);
    onComplete();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-coral" />
            Bienvenue dans Réserver un Binôme !
          </DialogTitle>
          <DialogDescription>
            Planifie des sessions avec d'autres personnes dans ta ville
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-1 my-4">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                idx === currentStep ? "bg-coral" : idx < currentStep ? "bg-coral/60" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Current step content */}
        <div className="py-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-coral/10 to-signal-green/10">
              {steps[currentStep].icon}
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              {steps[currentStep].title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <p className="text-center text-sm text-muted-foreground">
          Étape {currentStep + 1} sur {steps.length}
        </p>

        {/* Features summary on last step */}
        {currentStep === steps.length - 1 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-foreground mb-3">Fonctionnalités incluses :</p>
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="text-coral">{feature.icon}</div>
                <div>
                  <p className="text-sm font-medium text-foreground">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 gap-3">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Passer
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={prevStep}>
                Retour
              </Button>
            )}
            <Button
              onClick={nextStep}
              className="bg-coral hover:bg-coral/90 gap-1"
            >
              {currentStep === steps.length - 1 ? "C'est parti !" : "Suivant"}
              {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compact description card for the page header
export function BinomeDescriptionCard() {
  const [showFullGuide, setShowFullGuide] = useState(false);

  const handleResetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowFullGuide(true);
  };

  return (
    <>
      <Card className="bg-gradient-to-r from-coral/5 to-signal-green/5 border-coral/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-coral/10 shrink-0">
              <Users className="h-5 w-5 text-coral" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm mb-1">
                Comment ça marche ?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Crée un créneau ou rejoins-en un dans ta ville. Le jour J, fais ton check-in 
                sur place et profite de ta session ! Tu peux créer jusqu'à 4 créneaux gratuits par mois.
              </p>
              <Button
                variant="link"
                size="sm"
                className="text-coral p-0 h-auto mt-2 text-xs"
                onClick={handleResetOnboarding}
              >
                Voir le tutoriel complet →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showFullGuide && (
        <BinomeOnboarding 
          onComplete={() => setShowFullGuide(false)} 
          forceShow={true}
        />
      )}
    </>
  );
}
