import { forwardRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { APP_VERSION, SUPPORT_EMAIL } from '@/lib/constants';
import { Heart } from 'lucide-react';

export const LandingFooter = forwardRef<HTMLElement>(function LandingFooter(_, ref) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <footer ref={ref} className="py-8 px-6 border-t border-muted/20 relative z-10">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
        <div className="flex flex-col items-center justify-between w-full gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-foreground">NEARVITY</span>
          </div>

          {/* Main links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <button onClick={() => navigate('/about')} className="hover:text-foreground transition-colors">
              {t('about.title')}
            </button>
            <button onClick={() => navigate('/pricing')} className="hover:text-foreground transition-colors">
              {t('headerNav.pricing')}
            </button>
            <button onClick={() => navigate('/faq')} className="hover:text-foreground transition-colors">
              {t('headerNav.faq')}
            </button>
            <button onClick={() => navigate('/help')} className="hover:text-foreground transition-colors">
              {t('nav.help')}
            </button>
            <button onClick={() => navigate('/install')} className="hover:text-coral transition-colors font-medium">
              {t('landing.install')}
            </button>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground transition-colors">
              {t('landing.contact')}
            </a>
          </div>
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground/70">
          <button onClick={() => navigate('/legal/mentions')} className="hover:text-foreground transition-colors">
            {t('mentions.title')}
          </button>
          <span className="hidden sm:inline">|</span>
          <button onClick={() => navigate('/legal/terms')} className="hover:text-foreground transition-colors">
            {t('landing.terms')}
          </button>
          <span className="hidden sm:inline">|</span>
          <button onClick={() => navigate('/legal/cgv')} className="hover:text-foreground transition-colors">
            {t('cgv.title')}
          </button>
          <span className="hidden sm:inline">|</span>
          <button onClick={() => navigate('/legal/privacy')} className="hover:text-foreground transition-colors">
            {t('nav.privacy')}
          </button>
          <span className="hidden sm:inline">|</span>
          <button onClick={() => navigate('/legal/cookies')} className="hover:text-foreground transition-colors">
            {t('cookiePolicy.title')}
          </button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <Link to="/changelog" className="font-medium hover:text-coral transition-colors">
            NEARVITY v{APP_VERSION} &bull; PWA
          </Link>
          <p className="mt-1 flex items-center justify-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-coral fill-coral" /> in France by EmotionsCare Sasu
          </p>
        </div>
      </div>
    </footer>
  );
});
