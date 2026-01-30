import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Users, MapPin, MessageCircle, CheckCircle2, Star, Clock, ChevronRight, Sparkles, Heart, HandHeart, Users2, Smile, Quote } from 'lucide-react';
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
    icon: <Heart className="h-8 w-8 text-coral" />,
    title: "Lutte contre la solitude",
    description: "EASY te connecte avec des personnes qui partagent tes envies. Fini l'isolement : trouve un binôme pour réviser, manger, faire du sport ou simplement discuter."
  },
  {
    icon: <Calendar className="h-8 w-8 text-signal-green" />,
    title: "Crée ou rejoins un créneau",
    description: "Planifie une session de 45min, 1h30 ou 3h dans ta ville. Choisis l'activité : étudier, travailler, sport, repas, discussion..."
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Trouve ton binôme",
    description: "D'autres personnes peuvent rejoindre ton créneau. Maximum 4 participants pour une ambiance conviviale et des liens authentiques."
  },
  {
    icon: <MapPin className="h-8 w-8 text-coral" />,
    title: "Rencontre en vrai",
    description: "Le jour J, confirme ta présence sur place (check-in GPS). C'est l'occasion de créer de vraies connexions humaines !"
  },
  {
    icon: <HandHeart className="h-8 w-8 text-signal-green" />,
    title: "Crée du lien durable",
    description: "Chaque rencontre peut devenir une amitié, un groupe de motivation, ou plus encore. Évalue ton expérience pour aider la communauté à grandir."
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
            <Heart className="h-6 w-6 text-coral" />
            Bienvenue sur EASY !
          </DialogTitle>
          <DialogDescription>
            Crée du lien en vrai. Lutte contre la solitude.
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
              <Heart className="h-5 w-5 text-coral" />
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

// "Pourquoi EASY ?" section with human benefits
const whyEasyBenefits = [
  {
    icon: <Heart className="h-6 w-6 text-coral" />,
    title: "Lutte contre la solitude",
    description: "Ne reste plus seul·e. Trouve quelqu'un pour partager un moment, une activité, une discussion."
  },
  {
    icon: <Users2 className="h-6 w-6 text-signal-green" />,
    title: "Crée du lien authentique",
    description: "Amitié, groupe de motivation, entraide... Chaque rencontre peut devenir une relation durable."
  },
  {
    icon: <Smile className="h-6 w-6 text-primary" />,
    title: "Améliore ton bien-être",
    description: "Les interactions sociales réduisent le stress, boostent la motivation et donnent du sens au quotidien."
  },
  {
    icon: <HandHeart className="h-6 w-6 text-coral" />,
    title: "Construis ta communauté",
    description: "Rejoins des personnes qui partagent tes centres d'intérêt et crée ton propre réseau de soutien."
  }
];

// Animation variants for staggered cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25
    }
  }
};

export function WhyEasySection() {
  return (
    <Card className="bg-gradient-to-br from-background to-muted/30 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <Heart className="h-5 w-5 text-coral" />
          Pourquoi EASY ?
        </CardTitle>
        <CardDescription>
          Plus qu'une app de rencontre : un outil pour créer du lien en vrai
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {whyEasyBenefits.map((benefit, idx) => (
            <motion.div 
              key={idx} 
              variants={cardVariants}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-background/80 shrink-0">
                {benefit.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground text-sm mb-0.5">
                  {benefit.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-4 p-3 rounded-xl bg-coral/5 border border-coral/20"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-semibold text-coral">La solitude touche 1 étudiant sur 2.</span>
            <br />
            EASY t'aide à briser l'isolement, une rencontre à la fois.
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}

// Condensed version for empty states
export function WhyEasyCondensed() {
  return (
    <motion.div 
      className="p-4 rounded-xl bg-gradient-to-r from-coral/5 to-signal-green/5 border border-coral/20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Heart className="h-5 w-5 text-coral" />
        <h4 className="font-semibold text-foreground text-sm">Pourquoi créer un créneau ?</h4>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        Fini la solitude ! Propose une activité et rencontre des personnes qui partagent tes envies. 
        Chaque créneau peut devenir une amitié, un groupe de soutien, ou plus encore.
      </p>
      <div className="flex flex-wrap gap-2">
        {["Réviser ensemble", "Déjeuner", "Sport", "Discuter"].map((activity) => (
          <span 
            key={activity}
            className="px-2 py-1 text-xs rounded-full bg-background/80 text-muted-foreground border border-border/50"
          >
            {activity}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// Testimonials section
const testimonials = [
  {
    quote: "J'ai trouvé mon groupe de révisions grâce à EASY. On se retrouve chaque semaine à la BU et c'est devenu des vrais amis !",
    author: "Marie, 21 ans",
    activity: "Révisions"
  },
  {
    quote: "En arrivant dans une nouvelle ville, j'avais du mal à rencontrer des gens. EASY m'a permis de me sentir moins seul dès la première semaine.",
    author: "Thomas, 24 ans",
    activity: "Sport & Discussions"
  },
  {
    quote: "C'est super de pouvoir déjeuner avec quelqu'un plutôt que seule devant mon ordi. Ça change vraiment le quotidien !",
    author: "Léa, 22 ans",
    activity: "Déjeuner"
  }
];

export function TestimonialsSection() {
  return (
    <Card className="bg-gradient-to-br from-background to-muted/30 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <Quote className="h-5 w-5 text-coral" />
          Ils ont testé EASY
        </CardTitle>
        <CardDescription>
          Des rencontres qui changent le quotidien
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <motion.div 
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div 
              key={idx}
              variants={cardVariants}
              className="p-4 rounded-xl bg-muted/30 border border-border/30"
            >
              <p className="text-sm text-foreground italic mb-3">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  — {testimonial.author}
                </span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-coral/10 text-coral">
                  {testimonial.activity}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
