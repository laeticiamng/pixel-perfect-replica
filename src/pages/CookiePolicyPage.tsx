import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { useTranslation } from '@/lib/i18n';
import { LEGAL_EMAIL } from '@/lib/constants';

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
        <h1 className="text-xl font-bold text-foreground">{t('cookiePolicy.policyTitle')}</h1>
      </header>

      <div className="px-6 space-y-6">
        <div className="glass rounded-xl p-6 space-y-6">
          <p className="text-muted-foreground text-sm">{t('cookiePolicy.lastUpdated')}</p>

          {/* Intro */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.introTitle')}</h2>
            <p className="text-muted-foreground">{t('cookiePolicy.introText')}</p>
          </section>

          {/* Essential cookies */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.essentialTitle')}</h2>
            <p className="text-muted-foreground">{t('cookiePolicy.essentialText')}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>{t('cookiePolicy.essentialItem1')}</li>
              <li>{t('cookiePolicy.essentialItem2')}</li>
              <li>{t('cookiePolicy.essentialItem3')}</li>
              <li>{t('cookiePolicy.essentialItem4')}</li>
            </ul>
          </section>

          {/* Functional cookies */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.functionalTitle')}</h2>
            <p className="text-muted-foreground">{t('cookiePolicy.functionalText')}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>{t('cookiePolicy.functionalItem1')}</li>
              <li>{t('cookiePolicy.functionalItem2')}</li>
            </ul>
          </section>

          {/* Analytics */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.analyticsTitle')}</h2>
            <p className="text-muted-foreground font-medium">{t('cookiePolicy.analyticsText')}</p>
          </section>

          {/* Managing cookies */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.managingTitle')}</h2>
            <p className="text-muted-foreground">{t('cookiePolicy.managingText')}</p>
          </section>

          {/* Contact */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.contactTitle')}</h2>
            <p className="text-muted-foreground">
              {t('cookiePolicy.contactText')}{' '}
              <a href={`mailto:${LEGAL_EMAIL}`} className="text-coral">{LEGAL_EMAIL}</a>
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
