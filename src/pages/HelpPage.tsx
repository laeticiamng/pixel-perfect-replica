import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ExternalLink, Mail, MessageCircle, FileText, Shield, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { APP_VERSION } from '@/lib/constants';

export default function HelpPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      questionKey: 'help.howDoesEasyWork',
      answerKey: 'help.howDoesEasyWorkAnswer',
    },
    {
      questionKey: 'help.isMyLocationStored',
      answerKey: 'help.isMyLocationStoredAnswer',
    },
    {
      questionKey: 'help.whatIsGhostMode',
      answerKey: 'help.whatIsGhostModeAnswer',
    },
    {
      questionKey: 'help.howToReportBehavior',
      answerKey: 'help.howToReportBehaviorAnswer',
    },
    {
      questionKey: 'help.howToDeleteAccount',
      answerKey: 'help.howToDeleteAccountAnswer',
    },
    {
      questionKey: 'help.isMyDataSecure',
      answerKey: 'help.isMyDataSecureAnswer',
    },
    {
      questionKey: 'help.whatIsVisibilityDistance',
      answerKey: 'help.whatIsVisibilityDistanceAnswer',
    },
    {
      questionKey: 'help.howDoesRatingWork',
      answerKey: 'help.howDoesRatingWorkAnswer',
    },
    {
      questionKey: 'help.whatIsEvent',
      answerKey: 'help.whatIsEventAnswer',
    },
    {
      questionKey: 'help.howToContactSupport',
      answerKey: 'help.howToContactSupportAnswer',
    },
    {
      questionKey: 'help.isEasyFree',
      answerKey: 'help.isEasyFreeAnswer',
    },
    {
      questionKey: 'help.howDoesMiniChatWork',
      answerKey: 'help.howDoesMiniChatWorkAnswer',
    },
  ];

  const translatedFaqs = useMemo(() => 
    faqs.map(faq => ({
      question: t(faq.questionKey),
      answer: t(faq.answerKey),
    })),
    [t]
  );

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return translatedFaqs;
    const query = searchQuery.toLowerCase();
    return translatedFaqs.filter(
      faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
  }, [searchQuery, translatedFaqs]);

  const supportLinks = [
    { icon: <Mail className="h-5 w-5" />, label: t('help.contactUs'), href: 'mailto:support@easy-app.fr' },
    { icon: <MessageCircle className="h-5 w-5" />, label: t('help.community'), href: 'https://discord.gg', external: true },
    { icon: <FileText className="h-5 w-5" />, label: t('help.termsOfUse'), href: '/terms' },
    { icon: <Shield className="h-5 w-5" />, label: t('help.privacyPolicy'), href: '/privacy' },
  ];

  return (
    <PageLayout className="pb-8 safe-bottom">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(user ? '/profile' : '/')}
          className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
          aria-label={user ? t('help.backToProfile') : t('help.backToHome')}
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('help.title')}</h1>
        <span className="ml-auto px-2 py-1 text-xs font-medium bg-coral/20 text-coral rounded-lg">
          {faqs.length} {t('questions')}
        </span>
      </header>

      <motion.div 
        className="px-6 space-y-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.15 },
          },
        }}
      >
        {/* Search */}
        <motion.div 
          className="relative"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('help.searchQuestion')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
          />
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t('help.frequentQuestions')} {searchQuery && `(${filteredFaqs.length} ${t('results')})`}
          </h2>
          <div className="glass rounded-xl overflow-hidden">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className={`p-4 ${index !== filteredFaqs.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <p className="font-medium text-foreground mb-2">{faq.question}</p>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">{t('help.noQuestionFound')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('help.tryOtherKeywords')}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Support Links */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t('help.support')}
          </h2>
          <div className="glass rounded-xl overflow-hidden">
            {supportLinks.map((link, index) => {
              const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto');
              
              if (isExternal) {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className={`flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors ${
                      index !== supportLinks.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <span className="text-muted-foreground">{link.icon}</span>
                    <span className="flex-1 text-foreground">{link.label}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                );
              }
              
              return (
                <button
                  key={link.label}
                  onClick={() => navigate(link.href)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors ${
                    index !== supportLinks.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <span className="text-muted-foreground">{link.icon}</span>
                  <span className="flex-1 text-left text-foreground">{link.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Version Info */}
        <motion.div 
          className="text-center py-4"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.4, delay: 0.2 } },
          }}
        >
          <Link to="/changelog" className="text-xs text-muted-foreground hover:text-coral transition-colors font-medium">
            EASY v{APP_VERSION}
          </Link>
          <p className="text-xs text-muted-foreground mt-1">{t('landing.madeWith')}</p>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}
