import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { useTranslation } from '@/lib/i18n';
import { LEGAL_EMAIL } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export default function MentionsLegalesPage() {
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
        <h1 className="text-xl font-bold text-foreground">{t('mentions.title')}</h1>
      </header>

      <div className="px-6 space-y-6">
        <div className="glass rounded-xl p-6 space-y-6">
          <p className="text-muted-foreground text-sm">{t('mentions.lastUpdated')}</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.editorTitle')}</h2>
            <p className="text-muted-foreground">{t('mentions.editorText')}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>{t('mentions.companyName')}</li>
              <li>{t('mentions.companyForm')}</li>
              <li>{t('mentions.companyAddress')}</li>
              <li>{t('mentions.companyEmail')} : <a href={`mailto:${LEGAL_EMAIL}`} className="text-coral">{LEGAL_EMAIL}</a></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.directorTitle')}</h2>
            <p className="text-muted-foreground">{t('mentions.directorText')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.hostingTitle')}</h2>
            <p className="text-muted-foreground">{t('mentions.hostingText')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.ipTitle')}</h2>
            <p className="text-muted-foreground">{t('mentions.ipText')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.liabilityTitle')}</h2>
            <p className="text-muted-foreground">{t('mentions.liabilityText')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.personalDataTitle')}</h2>
            <p className="text-muted-foreground">
              {t('mentions.personalDataText')}{' '}
              <Link to="/legal/privacy" className="text-coral hover:text-coral-dark">{t('help.privacyPolicy')}</Link>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.cookiesTitle')}</h2>
            <p className="text-muted-foreground">
              {t('mentions.cookiesText')}{' '}
              <Link to="/legal/cookies" className="text-coral hover:text-coral-dark">{t('cookiePolicy.title')}</Link>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.disputeTitle')}</h2>
            <p className="text-muted-foreground">{t('mentions.disputeText')}</p>
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
