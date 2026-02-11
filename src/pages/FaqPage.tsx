import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mail, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { SUPPORT_EMAIL } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

function FaqAccordion({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <Card className="glass-card border-muted/30 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-muted/20 transition-colors"
      >
        <span className="font-medium text-foreground">{item.question}</span>
        <ChevronDown className={cn("h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function FaqPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: t('all') },
    { id: 'general', label: t('faqPage.categoryGeneral') },
    { id: 'privacy', label: t('faqPage.categoryPrivacy') },
    { id: 'features', label: t('faqPage.categoryFeatures') },
    { id: 'account', label: t('faqPage.categoryAccount') },
  ];

  const faqItems: FaqItem[] = [
    // General
    { question: t('faqPage.whatIsNearvity'), answer: t('faqPage.whatIsNearvityAnswer'), category: 'general' },
    { question: t('faqPage.howDoesItWork'), answer: t('faqPage.howDoesItWorkAnswer'), category: 'general' },
    { question: t('faqPage.isItFree'), answer: t('faqPage.isItFreeAnswer'), category: 'general' },
    { question: t('faqPage.isItDatingApp'), answer: t('faqPage.isItDatingAppAnswer'), category: 'general' },
    // Privacy
    { question: t('faqPage.isLocationStored'), answer: t('faqPage.isLocationStoredAnswer'), category: 'privacy' },
    { question: t('faqPage.whatIsGhostMode'), answer: t('faqPage.whatIsGhostModeAnswer'), category: 'privacy' },
    { question: t('faqPage.canIBlockSomeone'), answer: t('faqPage.canIBlockSomeoneAnswer'), category: 'privacy' },
    { question: t('faqPage.gdprExport'), answer: t('faqPage.gdprExportAnswer'), category: 'privacy' },
    // Features
    { question: t('faqPage.whatAreSignals'), answer: t('faqPage.whatAreSignalsAnswer'), category: 'features' },
    { question: t('faqPage.whatIsBinome'), answer: t('faqPage.whatIsBinomeAnswer'), category: 'features' },
    { question: t('faqPage.emergencyButton'), answer: t('faqPage.emergencyButtonAnswer'), category: 'features' },
    // Account
    { question: t('faqPage.howToDeleteAccount'), answer: t('faqPage.howToDeleteAccountAnswer'), category: 'account' },
    { question: t('faqPage.canIChangeUniversity'), answer: t('faqPage.canIChangeUniversityAnswer'), category: 'account' },
  ];

  const filteredItems = faqItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      <main className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('faqPage.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('faqPage.subtitle')}</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t('help.searchQuestion')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 bg-deep-blue-light border-border rounded-xl text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeCategory === cat.id
                  ? "bg-coral text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-12"
        >
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('help.noQuestionFound')}</p>
              <p className="text-sm text-muted-foreground/70 mt-1">{t('help.tryOtherKeywords')}</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <FaqAccordion
                key={index}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))
          )}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Card className="glass-card border-coral/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-2">{t('faqPage.stillHaveQuestions')}</h3>
              <p className="text-muted-foreground mb-4">{t('faqPage.contactSupport')}</p>
              <Button asChild variant="outline" className="gap-2">
                <a href={`mailto:${SUPPORT_EMAIL}`}>
                  <Mail className="h-4 w-4" />
                  {SUPPORT_EMAIL}
                </a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <LandingFooter />
    </div>
  );
}
