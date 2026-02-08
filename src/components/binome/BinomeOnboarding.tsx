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
import { ConfettiCelebration } from './ConfettiCelebration';
import { useTranslation } from '@/lib/i18n';

interface BinomeOnboardingProps {
  onComplete: () => void;
  forceShow?: boolean;
}

const ONBOARDING_KEY = 'binome_onboarding_completed';

const stepIcons = [
  <Heart className="h-8 w-8 text-coral" />,
  <Calendar className="h-8 w-8 text-signal-green" />,
  <Users className="h-8 w-8 text-primary" />,
  <MapPin className="h-8 w-8 text-coral" />,
  <HandHeart className="h-8 w-8 text-signal-green" />,
];

const featureIcons = [
  <Clock className="h-5 w-5" />,
  <CheckCircle2 className="h-5 w-5" />,
  <Sparkles className="h-5 w-5" />,
];

export function BinomeOnboarding({ onComplete, forceShow = false }: BinomeOnboardingProps) {
  const { t } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const steps = [
    { icon: stepIcons[0], title: t('binomeOnboarding.step1Title'), description: t('binomeOnboarding.step1Desc') },
    { icon: stepIcons[1], title: t('binomeOnboarding.step2Title'), description: t('binomeOnboarding.step2Desc') },
    { icon: stepIcons[2], title: t('binomeOnboarding.step3Title'), description: t('binomeOnboarding.step3Desc') },
    { icon: stepIcons[3], title: t('binomeOnboarding.step4Title'), description: t('binomeOnboarding.step4Desc') },
    { icon: stepIcons[4], title: t('binomeOnboarding.step5Title'), description: t('binomeOnboarding.step5Desc') },
  ];

  const features = [
    { icon: featureIcons[0], label: t('binomeOnboarding.featureReminders'), description: t('binomeOnboarding.featureRemindersDesc') },
    { icon: featureIcons[1], label: t('binomeOnboarding.featureReliability'), description: t('binomeOnboarding.featureReliabilityDesc') },
    { icon: featureIcons[2], label: t('binomeOnboarding.featureFreeSlots'), description: t('binomeOnboarding.featureFreeSlotsDesc') },
  ];

  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompleted || forceShow) {
      setShowDialog(true);
    }
  }, [forceShow]);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowConfetti(true);
    setTimeout(() => {
      setShowDialog(false);
      onComplete();
    }, 1500);
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
    <>
      <ConfettiCelebration trigger={showConfetti} />
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-6 w-6 text-coral" />
            {t('binomeOnboarding.welcome')}
          </DialogTitle>
          <DialogDescription>
            {t('binomeOnboarding.subtitle')}
          </DialogDescription>
        </DialogHeader>

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

        <p className="text-center text-sm text-muted-foreground">
          {t('binomeOnboarding.stepOf', { current: currentStep + 1, total: steps.length })}
        </p>

        {currentStep === steps.length - 1 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-foreground mb-3">{t('binomeOnboarding.featuresIncluded')}</p>
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

        <div className="flex items-center justify-between mt-6 gap-3">
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
            {t('skip')}
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={prevStep}>
                {t('back')}
              </Button>
            )}
            <Button onClick={nextStep} className="bg-coral hover:bg-coral/90 gap-1">
              {currentStep === steps.length - 1 ? t('binomeOnboarding.letsGo') : t('next')}
              {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

// Compact description card for the page header
export function BinomeDescriptionCard() {
  const { t } = useTranslation();
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
                {t('binomeDescription.howItWorks')}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('binomeDescription.description')}
              </p>
              <Button
                variant="link"
                size="sm"
                className="text-coral p-0 h-auto mt-2 text-xs"
                onClick={handleResetOnboarding}
              >
                {t('binomeDescription.viewTutorial')}
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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

export function WhyNearvitySection() {
  const { t } = useTranslation();

  const whyNearvityBenefits = [
    { icon: <Heart className="h-6 w-6 text-coral" />, title: t('whyNearvity.benefit1Title'), description: t('whyNearvity.benefit1Desc') },
    { icon: <Users2 className="h-6 w-6 text-signal-green" />, title: t('whyNearvity.benefit2Title'), description: t('whyNearvity.benefit2Desc') },
    { icon: <Smile className="h-6 w-6 text-primary" />, title: t('whyNearvity.benefit3Title'), description: t('whyNearvity.benefit3Desc') },
    { icon: <HandHeart className="h-6 w-6 text-coral" />, title: t('whyNearvity.benefit4Title'), description: t('whyNearvity.benefit4Desc') },
  ];

  return (
    <Card className="bg-gradient-to-br from-background to-muted/30 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <Heart className="h-5 w-5 text-coral" />
          {t('whyNearvity.title')}
        </CardTitle>
        <CardDescription>
          {t('whyNearvity.subtitle')}
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
          {whyNearvityBenefits.map((benefit, idx) => (
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
            <span className="font-semibold text-coral">{t('whyNearvity.statHighlight')}</span>
            <br />
            {t('whyNearvity.statMessage')}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}

// Condensed version for empty states
export function WhyNearvityCondensed() {
  const { t } = useTranslation();

  const activities = [
    t('whyNearvity.studyTogether'),
    t('whyNearvity.lunch'),
    t('whyNearvity.sport'),
    t('whyNearvity.chat'),
  ];

  return (
    <motion.div 
      className="p-4 rounded-xl bg-gradient-to-r from-coral/5 to-signal-green/5 border border-coral/20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Heart className="h-5 w-5 text-coral" />
        <h4 className="font-semibold text-foreground text-sm">{t('whyNearvity.condensedTitle')}</h4>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        {t('whyNearvity.condensedDesc')}
      </p>
      <div className="flex flex-wrap gap-2">
        {activities.map((activity) => (
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
export function TestimonialsSection() {
  const { t } = useTranslation();

  const testimonials = [
    { quote: t('testimonials.quote1'), author: t('testimonials.author1'), activity: t('testimonials.activity1') },
    { quote: t('testimonials.quote2'), author: t('testimonials.author2'), activity: t('testimonials.activity2') },
    { quote: t('testimonials.quote3'), author: t('testimonials.author3'), activity: t('testimonials.activity3') },
  ];

  return (
    <Card className="bg-gradient-to-br from-background to-muted/30 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <Quote className="h-5 w-5 text-coral" />
          {t('testimonials.title')}
        </CardTitle>
        <CardDescription>
          {t('testimonials.subtitle')}
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
