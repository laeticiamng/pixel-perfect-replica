import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { SUPPORT_EMAIL } from '@/lib/constants';

interface FAQItemProps {
  question: string;
  answer: string;
  delay?: number;
}

function FAQItem({ question, answer, delay = 0 }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-medium text-foreground">{question}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function FAQPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sections = [
    {
      title: t('faq.generalTitle'),
      items: [
        { q: t('faq.whatIsNearvity'), a: t('faq.whatIsNearvityAnswer') },
        { q: t('faq.howDoesItWork'), a: t('faq.howDoesItWorkAnswer') },
        { q: t('faq.isItADatingApp'), a: t('faq.isItADatingAppAnswer') },
        { q: t('faq.whoCanUse'), a: t('faq.whoCanUseAnswer') },
      ],
    },
    {
      title: t('faq.safetyTitle'),
      items: [
        { q: t('faq.isMyLocationSafe'), a: t('faq.isMyLocationSafeAnswer') },
        { q: t('faq.whatIsGhostMode'), a: t('faq.whatIsGhostModeAnswer') },
        { q: t('faq.howToReport'), a: t('faq.howToReportAnswer') },
        { q: t('faq.canIDeleteMyData'), a: t('faq.canIDeleteMyDataAnswer') },
      ],
    },
    {
      title: t('faq.featuresTitle'),
      items: [
        { q: t('faq.whatAreSignals'), a: t('faq.whatAreSignalsAnswer') },
        { q: t('faq.whatIsBinome'), a: t('faq.whatIsBinomeAnswer') },
      ],
    },
    {
      title: t('faq.pricingTitle'),
      items: [
        { q: t('faq.isNearvityFree'), a: t('faq.isNearvityFreeAnswer') },
      ],
    },
  ];

  return (
    <PageLayout showSidebar={false}>
      <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t('faq.title')}</h1>
        </header>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-muted-foreground mb-10 text-lg"
        >
          {t('faq.subtitle')}
        </motion.p>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {sections.map((section, sIdx) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.1 }}
            >
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h2>
              <Card className="glass-card border-muted/30 overflow-hidden">
                <CardContent className="p-0">
                  {section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={idx !== section.items.length - 1 ? 'border-b border-border' : ''}
                    >
                      <FAQItem
                        question={item.q}
                        answer={item.a}
                        delay={sIdx * 0.1 + idx * 0.05}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.section>
          ))}
        </div>

        {/* Contact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <h3 className="text-lg font-semibold mb-2">{t('faq.moreQuestions')}</h3>
          <p className="text-muted-foreground mb-4">{t('faq.moreQuestionsDesc')}</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 text-coral hover:text-coral-dark transition-colors font-medium"
          >
            <Mail className="h-4 w-4" />
            {SUPPORT_EMAIL}
          </a>
        </motion.section>

        {/* Back */}
        <div className="text-center py-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('help.backToHome')}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
