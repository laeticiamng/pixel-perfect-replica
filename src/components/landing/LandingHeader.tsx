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
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Frosted glass effect with subtle bottom border */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl border-b border-border/30" />
      
      <div className="relative max-w-7xl mx-auto flex items-center justify-between gap-2 px-3 sm:px-6 py-2.5 sm:py-3">
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label={t('a11y.homeLink')}>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-lg shadow-coral/20">
            <span className="text-white font-black text-sm sm:text-base">N</span>
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-coral to-coral-light bg-clip-text text-transparent">
            NEARVITY
          </span>
        </Link>

        {/* Desktop nav — kept lean: How it works · Pricing · Sign in · Start CTA */}
        <nav className="hidden sm:flex items-center gap-0.5 sm:gap-1 shrink-0" aria-label="Main navigation">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground text-xs sm:text-sm px-2.5 sm:px-3 rounded-full"
            onClick={scrollToHowItWorks}
          >
            {t('landing.seeHowItWorks')}
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs sm:text-sm px-2.5 sm:px-3 hidden md:inline-flex rounded-full">
            <Link to="/premium">{t('premium.title')}</Link>
          </Button>
          <LanguageToggle />
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs sm:text-sm px-2.5 sm:px-3 whitespace-nowrap rounded-full">
            <Link to="/onboarding" state={{ isLogin: true }}>
              {t('auth.signIn')}
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-to-r from-coral to-coral-light text-white hover:shadow-lg hover:shadow-coral/25 text-xs sm:text-sm px-3 sm:px-4 rounded-full font-semibold ml-1">
            <Link to="/onboarding">{t('common.cta.startFree') || t('landing.startNow')}</Link>
          </Button>
        </nav>

        {/* Mobile nav controls */}
        <div className="flex sm:hidden items-center gap-0.5">
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
            className="relative sm:hidden border-t border-border/30 bg-background/90 backdrop-blur-2xl overflow-hidden"
          >
            <nav className="flex flex-col px-4 py-3 gap-0.5" aria-label="Mobile navigation">
              <button
                onClick={scrollToHowItWorks}
                className="text-left text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-xl hover:bg-muted/30 transition-colors"
              >
                {t('landing.seeHowItWorks')}
              </button>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-xl hover:bg-muted/30 transition-colors"
              >
                {t('about.title')}
              </Link>
              <Link
                to="/premium"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-xl hover:bg-muted/30 transition-colors"
              >
                {t('premium.title')}
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-xl hover:bg-muted/30 transition-colors"
              >
                {t('landing.contact')}
              </Link>
              <Link
                to="/install"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-coral hover:text-coral-dark py-2.5 px-3 rounded-xl hover:bg-coral/5 transition-colors flex items-center gap-2"
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
