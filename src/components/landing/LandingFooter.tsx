import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { APP_VERSION } from '@/lib/constants';
export function LandingFooter() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <footer className="py-8 px-6 border-t border-muted/20 relative z-10">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-foreground">EASY</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <button 
              onClick={() => navigate('/install')}
              className="hover:text-coral transition-colors font-medium"
            >
              📲 {t('landing.install')}
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="hover:text-foreground transition-colors"
            >
              {t('about.title')}
            </button>
            <button 
              onClick={() => navigate('/help')}
              className="hover:text-foreground transition-colors"
            >
              {t('nav.help')}
            </button>
            <button 
              onClick={() => navigate('/terms')}
              className="hover:text-foreground transition-colors"
            >
              {t('landing.terms')}
            </button>
            <button 
              onClick={() => navigate('/privacy')}
              className="hover:text-foreground transition-colors"
            >
              {t('nav.privacy')}
            </button>
            <a 
              href="mailto:support@easy-app.fr"
              className="hover:text-foreground transition-colors"
            >
              {t('landing.contact')}
            </a>
          </div>
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
          <Link to="/changelog" className="font-medium hover:text-coral transition-colors">
            EASY v{APP_VERSION} • PWA
          </Link>
          <p className="mt-1">{t('landing.madeWith')}</p>
        </div>
      </div>
    </footer>
  );
}
