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
        <div className="flex flex-col items-center justify-between w-full gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet to-violet-dark flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-foreground">NEARVITY</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate('/install')} className="hover:text-coral transition-colors font-medium">
              {t('landing.install')}
            </button>
            <button onClick={() => navigate('/about')} className="hover:text-foreground transition-colors">
              {t('about.title')}
            </button>
            <button onClick={() => navigate('/help')} className="hover:text-foreground transition-colors">
              {t('nav.help')}
            </button>
            <button onClick={() => navigate('/terms')} className="hover:text-foreground transition-colors">
              {t('landing.terms')}
            </button>
            <button onClick={() => navigate('/privacy')} className="hover:text-foreground transition-colors">
              {t('nav.privacy')}
            </button>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground transition-colors">
              {t('landing.contact')}
            </a>
          </div>
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
          <Link to="/changelog" className="font-medium hover:text-violet transition-colors">
            NEARVITY v{APP_VERSION} — Made in France by EmotionsCare SASU
          </Link>
          <p className="mt-1 flex items-center justify-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-violet fill-violet" /> in France
          </p>
        </div>
      </div>
    </footer>
  );
});
