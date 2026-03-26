import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { Heart } from 'lucide-react';

export const LandingFooter = forwardRef<HTMLElement>(function LandingFooter(_, ref) {
  const { t } = useTranslation();

  return (
    <footer ref={ref} className="py-10 sm:py-12 px-6 border-t border-border/20 relative z-10">
      <div className="max-w-5xl mx-auto">
        {/* Top section: Logo + columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3" aria-label={t('a11y.homeLink')}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center">
                <span className="text-white font-bold text-xs">N</span>
              </div>
              <span className="font-bold text-foreground text-sm">NEARVITY</span>
            </Link>
            <p className="text-xs text-muted-foreground/70 leading-relaxed max-w-[200px]">
              {t('landing.heroTagline')}
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-[10px] sm:text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3">
              {t('nav.navigation')}
            </h4>
            <nav className="flex flex-col gap-1.5 text-sm text-muted-foreground/70">
              <Link to="/about" className="hover:text-foreground transition-colors py-0.5">
                {t('about.title')}
              </Link>
              <Link to="/premium" className="hover:text-foreground transition-colors py-0.5">
                {t('premium.title')}
              </Link>
              <Link to="/install" className="hover:text-coral transition-colors font-medium py-0.5">
                {t('landing.install')}
              </Link>
              <Link to="/changelog" className="hover:text-foreground transition-colors py-0.5">
                Changelog
              </Link>
            </nav>
          </div>

          {/* Support links */}
          <div>
            <h4 className="text-[10px] sm:text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3">
              {t('profile.support')}
            </h4>
            <nav className="flex flex-col gap-1.5 text-sm text-muted-foreground/70">
              <Link to="/help" className="hover:text-foreground transition-colors py-0.5">
                {t('nav.help')}
              </Link>
              <Link to="/contact" className="hover:text-foreground transition-colors py-0.5">
                {t('landing.contact')}
              </Link>
            </nav>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-[10px] sm:text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3">
              {t('nav.privacy')}
            </h4>
            <nav className="flex flex-col gap-1.5 text-sm text-muted-foreground/70">
              <Link to="/terms" className="hover:text-foreground transition-colors py-0.5">
                {t('landing.terms')}
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors py-0.5">
                {t('nav.privacy')}
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-5 border-t border-border/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground/50">
          <p className="flex items-center gap-1">
            {t('footer.madeWith')} <Heart className="h-3 w-3 text-coral/60 fill-coral/60" /> {t('footer.inFranceBy')} EmotionsCare SASU
          </p>
          <p>
            © {new Date().getFullYear()} NEARVITY. {t('landing.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
});
