import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { Heart } from 'lucide-react';

export const LandingFooter = forwardRef<HTMLElement>(function LandingFooter(_, ref) {
  const { t } = useTranslation();

  return (
    <footer ref={ref} className="relative z-10 border-t border-white/10">
      {/* Scrim — guarantees legibility over the 3D / orbs background. */}
      <div className="absolute inset-0 -z-10 section-scrim backdrop-blur-md" />

      <div className="py-10 sm:py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Top section: Logo + columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3" aria-label={t('a11y.homeLink')}>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-lg shadow-coral/30">
                  <span className="text-white font-bold text-xs">N</span>
                </div>
                <span className="font-bold text-white hc-text-strong text-sm hero-text-shadow-soft">NEARVITY</span>
              </Link>
              <p className="text-xs text-white/85 hc-text-strong leading-relaxed max-w-[220px] hero-text-shadow-soft">
                {t('landing.heroTagline')}
              </p>
            </div>

            {/* Product links */}
            <div>
              <h4 className="text-[10px] sm:text-xs font-bold text-white/95 hc-text-strong uppercase tracking-wider mb-3 hero-text-shadow-soft">
                {t('nav.navigation')}
              </h4>
              <nav className="flex flex-col gap-1.5 text-sm text-white/85 hc-text-strong hero-text-shadow-soft">
                <Link to="/about" className="hover:text-coral-light transition-colors py-0.5">
                  {t('about.title')}
                </Link>
                <Link to="/premium" className="hover:text-coral-light transition-colors py-0.5">
                  {t('premium.title')}
                </Link>
                <Link to="/install" className="hover:text-coral-light transition-colors font-medium py-0.5 text-coral-light hc-coral">
                  {t('landing.install')}
                </Link>
                <Link to="/changelog" className="hover:text-coral-light transition-colors py-0.5">
                  Changelog
                </Link>
              </nav>
            </div>

            {/* Support links */}
            <div>
              <h4 className="text-[10px] sm:text-xs font-bold text-white/95 hc-text-strong uppercase tracking-wider mb-3 hero-text-shadow-soft">
                {t('profile.support')}
              </h4>
              <nav className="flex flex-col gap-1.5 text-sm text-white/85 hc-text-strong hero-text-shadow-soft">
                <Link to="/help" className="hover:text-coral-light transition-colors py-0.5">
                  {t('nav.help')}
                </Link>
                <Link to="/contact" className="hover:text-coral-light transition-colors py-0.5">
                  {t('landing.contact')}
                </Link>
              </nav>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="text-[10px] sm:text-xs font-bold text-white/95 hc-text-strong uppercase tracking-wider mb-3 hero-text-shadow-soft">
                {t('nav.privacy')}
              </h4>
              <nav className="flex flex-col gap-1.5 text-sm text-white/85 hc-text-strong hero-text-shadow-soft">
                <Link to="/terms" className="hover:text-coral-light transition-colors py-0.5">
                  {t('landing.terms')}
                </Link>
                <Link to="/privacy" className="hover:text-coral-light transition-colors py-0.5">
                  {t('nav.privacy')}
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/80 hc-text-strong hero-text-shadow-soft">
            <p className="flex items-center gap-1">
              {t('footer.madeWith')} <Heart className="h-3 w-3 text-coral fill-coral" /> {t('footer.inFranceBy')} EmotionsCare SASU
            </p>
            <p>
              © {new Date().getFullYear()} NEARVITY. {t('landing.allRightsReserved')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});
