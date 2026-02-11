import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cookie, Shield, BarChart3, Globe } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { useTranslation } from '@/lib/i18n';
import { DPO_EMAIL } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export default function CookiePolicyPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <PageLayout showSidebar={false} className="pb-8 safe-bottom">
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('cookiePolicy.title')}</h1>
      </header>

      <div className="px-6 space-y-6">
        <div className="glass rounded-xl p-6 space-y-6">
          <p className="text-muted-foreground text-sm">{t('cookiePolicy.lastUpdated')}</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Cookie className="h-5 w-5 text-coral" />
              {t('cookiePolicy.introTitle')}
            </h2>
            <p className="text-muted-foreground">{t('cookiePolicy.introText')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-signal-green" />
              {t('cookiePolicy.essentialTitle')}
            </h2>
            <p className="text-muted-foreground">{t('cookiePolicy.essentialText')}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 text-sm">
              <li>{t('cookiePolicy.essentialAuth')}</li>
              <li>{t('cookiePolicy.essentialI18n')}</li>
              <li>{t('cookiePolicy.essentialTheme')}</li>
              <li>{t('cookiePolicy.essentialConsent')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-signal-yellow" />
              {t('cookiePolicy.analyticsTitle')}
            </h2>
            <p className="text-muted-foreground">{t('cookiePolicy.analyticsText')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-400" />
              {t('cookiePolicy.thirdPartyTitle')}
            </h2>
            <p className="text-muted-foreground">{t('cookiePolicy.thirdPartyText')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.managementTitle')}</h2>
            <p className="text-muted-foreground">{t('cookiePolicy.managementText')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.retentionTitle')}</h2>
            <p className="text-muted-foreground">{t('cookiePolicy.retentionText')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.contactTitle')}</h2>
            <p className="text-muted-foreground">
              {t('cookiePolicy.contactText')}{' '}
              <a href={`mailto:${DPO_EMAIL}`} className="text-coral">{DPO_EMAIL}</a>
            </p>
          </section>
        </div>

        <div className="text-center pb-4">
          <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('help.backToHome')}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
