import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/lib/i18n';

export function LandingHeader() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: t('headerNav.pricing'), href: '/pricing' },
    { label: t('headerNav.about'), href: '/about' },
    { label: t('headerNav.faq'), href: '/faq' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    navigate(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet to-violet-dark flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-lg">N</span>
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet to-violet-light bg-clip-text text-transparent">
            NEARVITY
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={() => navigate('/install')}
            variant="ghost"
            size="sm"
            className="text-violet hover:text-violet-dark hover:bg-violet/10 gap-1.5 hidden sm:flex"
          >
            <Download className="h-4 w-4" />
            <span className="hidden lg:inline">{t('landing.install')}</span>
          </Button>
          <LanguageToggle />
          <Button
            onClick={() => navigate('/onboarding')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hidden sm:flex"
          >
            {t('auth.signIn')}
          </Button>
          <Button
            onClick={() => navigate('/onboarding')}
            size="sm"
            className="bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-white hidden sm:flex"
          >
            {t('auth.signUp')}
          </Button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <div className="border-t border-border/50 mt-2 pt-2 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/onboarding'); }}
                className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {t('auth.signIn')}
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/onboarding'); }}
                className="mx-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral transition-colors"
              >
                {t('auth.signUp')}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
