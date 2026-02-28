import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/lib/i18n';

export function LandingHeader() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 sm:py-4 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-base sm:text-lg">N</span>
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-coral to-coral-light bg-clip-text text-transparent">
            NEARVITY
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <Button
            onClick={() => navigate('/install')}
            variant="ghost"
            size="sm"
            className="text-coral hover:text-coral-dark hover:bg-coral/10 gap-1.5 px-2 sm:px-3"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t('landing.install')}</span>
          </Button>
          <LanguageToggle />
          <Button
            onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap"
          >
            {t('auth.signIn')}
          </Button>
        </div>
      </div>
    </header>
  );
}
