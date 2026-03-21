import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/lib/i18n';
import { AnimatePresence, motion } from 'framer-motion';

export function LandingHeader() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToHowItWorks = () => {
    setMobileMenuOpen(false);
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 px-3 sm:px-6 py-3 sm:py-4">
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label={t('a11y.homeLink')}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-base sm:text-lg">N</span>
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-coral to-coral-light bg-clip-text text-transparent">
            NEARVITY
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1 sm:gap-3 shrink-0" aria-label="Main navigation">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground text-xs sm:text-sm px-2 sm:px-3"
            onClick={scrollToHowItWorks}
          >
            {t('landing.seeHowItWorks')}
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs sm:text-sm px-2 sm:px-3">
            <Link to="/about">{t('about.title')}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs sm:text-sm px-2 sm:px-3 hidden md:inline-flex">
            <Link to="/premium">{t('premium.title')}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs sm:text-sm px-2 sm:px-3 hidden md:inline-flex">
            <Link to="/contact">{t('landing.contact')}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-coral hover:text-coral-dark hover:bg-coral/10 gap-1.5 px-2 sm:px-3">
            <Link to="/install">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t('landing.install')}</span>
            </Link>
          </Button>
          <LanguageToggle />
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
            <Link to="/onboarding" state={{ isLogin: true }}>
              {t('auth.signIn')}
            </Link>
          </Button>
        </nav>

        {/* Mobile nav controls */}
        <div className="flex sm:hidden items-center gap-1">
          <LanguageToggle />
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs px-2 whitespace-nowrap">
            <Link to="/onboarding" state={{ isLogin: true }}>
              {t('auth.signIn')}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t('common.close') : 'Menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="flex flex-col px-4 py-3 gap-1" aria-label="Mobile navigation">
              <button
                onClick={scrollToHowItWorks}
                className="text-left text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {t('landing.seeHowItWorks')}
              </button>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {t('about.title')}
              </Link>
              <Link
                to="/premium"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {t('premium.title')}
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {t('landing.contact')}
              </Link>
              <Link
                to="/install"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-coral hover:text-coral-dark py-2.5 px-3 rounded-lg hover:bg-coral/5 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t('landing.install')}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
