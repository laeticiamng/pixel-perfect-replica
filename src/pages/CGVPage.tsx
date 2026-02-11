import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { useTranslation } from '@/lib/i18n';
import { LEGAL_EMAIL } from '@/lib/constants';

export default function CGVPage() {
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
        <h1 className="text-xl font-bold text-foreground">{t('cgv.title')}</h1>
      </header>

      <div className="px-6 space-y-6">
        <div className="glass rounded-xl p-6 space-y-4">
          <p className="text-muted-foreground text-sm">{t('cgv.lastUpdated')}</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cgv.section1Title')}</h2>
            <p className="text-muted-foreground">{t('cgv.section1Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cgv.section2Title')}</h2>
            <p className="text-muted-foreground">{t('cgv.section2Text')}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>{t('cgv.section2Item1')}</li>
              <li>{t('cgv.section2Item2')}</li>
              <li>{t('cgv.section2Item3')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cgv.section3Title')}</h2>
            <p className="text-muted-foreground">{t('cgv.section3Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cgv.section4Title')}</h2>
            <p className="text-muted-foreground">{t('cgv.section4Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cgv.section5Title')}</h2>
            <p className="text-muted-foreground">{t('cgv.section5Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cgv.section6Title')}</h2>
            <p className="text-muted-foreground">{t('cgv.section6Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cgv.section7Title')}</h2>
            <p className="text-muted-foreground">{t('cgv.section7Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('cgv.section8Title')}</h2>
            <p className="text-muted-foreground">
              {t('cgv.section8Text')}{' '}
              <a href={`mailto:${LEGAL_EMAIL}`} className="text-coral">{LEGAL_EMAIL}</a>
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
