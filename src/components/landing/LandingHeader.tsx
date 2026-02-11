import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Download, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function LandingHeader() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t('headerNav.features'), href: '/#features' },
    { label: t('headerNav.pricing'), href: '/pricing' },
    { label: t('headerNav.about'), href: '/about' },
    { label: t('headerNav.faq'), href: '/faq' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      // Scroll to section on landing page
      const sectionId = href.replace('/#', '');
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-lg">N</span>
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-coral to-coral-light bg-clip-text text-transparent">
            NEARVITY
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            onClick={() => navigate('/install')}
            variant="ghost"
            size="sm"
            className="text-coral hover:text-coral-dark hover:bg-coral/10 gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span className="hidden lg:inline">{t('landing.install')}</span>
          </Button>
          <LanguageToggle />
          <Button
            onClick={() => navigate('/login')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            {t('auth.signIn')}
          </Button>
          <Button
            onClick={() => navigate('/signup')}
            className="bg-coral hover:bg-coral-dark text-primary-foreground"
          >
            {t('auth.signUp')}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-border/50 bg-background/95 backdrop-blur-xl",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <nav className="px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-border/50 space-y-2">
            <Button
              onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
              variant="outline"
              className="w-full justify-center"
            >
              {t('auth.signIn')}
            </Button>
            <Button
              onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }}
              className="w-full justify-center bg-coral hover:bg-coral-dark text-primary-foreground"
            >
              {t('auth.signUp')}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
