import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { Heart } from 'lucide-react';

export const LandingFooter = forwardRef<HTMLElement>(function LandingFooter(_, ref) {
  const { t } = useTranslation();

  return (
    <footer ref={ref} className="py-12 px-6 border-t border-muted/20 relative z-10">
      <div className="max-w-5xl mx-auto">
        {/* Top section: Logo + columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3" aria-label={t('a11y.homeLink')}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-foreground">NEARVITY</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
              {t('landing.heroTagline')}
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              {t('nav.navigation')}
            </h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">
                {t('about.title')}
              </Link>
              <Link to="/premium" className="hover:text-foreground transition-colors">
                {t('premium.title')}
              </Link>
              <Link to="/install" className="hover:text-coral transition-colors font-medium">
                {t('landing.install')}
              </Link>
              <Link to="/changelog" className="hover:text-foreground transition-colors">
                Changelog
              </Link>
            </nav>
          </div>

          {/* Support links */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              {t('profile.support')}
            </h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/help" className="hover:text-foreground transition-colors">
                {t('nav.help')}
              </Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">
                {t('landing.contact')}
              </Link>
            </nav>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              {t('nav.privacy')}
            </h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">
                {t('landing.terms')}
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                {t('nav.privacy')}
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-1">
            {t('footer.madeWith')} <Heart className="h-3 w-3 text-coral fill-coral" /> {t('footer.inFranceBy')} EmotionsCare SASU
          </p>
          <p className="text-muted-foreground/60">
            © {new Date().getFullYear()} NEARVITY. {t('landing.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
});
