import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { useTranslation } from '@/lib/i18n';

export default function TermsPage() {
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
        <h1 className="text-xl font-bold text-foreground">{t('terms.title')}</h1>
      </header>

      <div className="px-6 space-y-6">
        <div className="glass rounded-xl p-6 space-y-4">
          <p className="text-muted-foreground text-sm">{t('terms.lastUpdated')}</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('terms.section1Title')}</h2>
            <p className="text-muted-foreground">{t('terms.section1Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('terms.section2Title')}</h2>
            <p className="text-muted-foreground">{t('terms.section2Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('terms.section3Title')}</h2>
            <p className="text-muted-foreground">{t('terms.section3Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('terms.section4Title')}</h2>
            <p className="text-muted-foreground">{t('terms.section4Text')}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>{t('terms.section4Item1')}</li>
              <li>{t('terms.section4Item2')}</li>
              <li>{t('terms.section4Item3')}</li>
              <li>{t('terms.section4Item4')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('terms.section5Title')}</h2>
            <p className="text-muted-foreground">{t('terms.section5Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('terms.section6Title')}</h2>
            <p className="text-muted-foreground">{t('terms.section6Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('terms.section7Title')}</h2>
            <p className="text-muted-foreground">{t('terms.section7Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('terms.section8Title')}</h2>
            <p className="text-muted-foreground">
              {t('terms.section8Text')}
              <a href="mailto:legal@nearvity.fr" className="text-coral ml-1">legal@nearvity.fr</a>
            </p>
          </section>
        </div>

        <p className="text-center text-xs text-muted-foreground">{t('terms.copyright')}</p>
      </div>
    </PageLayout>
  );
}
