import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { useTranslation } from '@/lib/i18n';
import { LEGAL_EMAIL } from '@/lib/constants';

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
          {/* Editeur */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.editorTitle')}</h2>
            <p className="text-muted-foreground">{t('mentions.editorText')}</p>
            <ul className="text-muted-foreground space-y-2 ml-4">
              <li><strong>{t('mentions.companyName')} :</strong> EmotionsCare SASU</li>
              <li><strong>{t('mentions.companyForm')} :</strong> {t('mentions.companyFormValue')}</li>
              <li><strong>{t('mentions.registeredOffice')} :</strong> {t('mentions.registeredOfficeValue')}</li>
            </ul>
          </section>

          {/* Directeur de publication */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.directorTitle')}</h2>
            <p className="text-muted-foreground">{t('mentions.directorValue')}</p>
          </section>

          {/* Hébergement */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.hostingTitle')}</h2>
            <p className="text-muted-foreground">{t('mentions.hostingText')}</p>
            <p className="text-muted-foreground font-medium">{t('mentions.hostingProvider')}</p>
          </section>

          {/* Propriété intellectuelle */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.intellectualPropertyTitle')}</h2>
            <p className="text-muted-foreground">{t('mentions.intellectualPropertyText')}</p>
          </section>

          {/* Données personnelles */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.personalDataTitle')}</h2>
            <p className="text-muted-foreground">
              {t('mentions.personalDataText')}{' '}
              <button
                onClick={() => navigate('/legal/privacy')}
                className="text-coral hover:underline"
              >
                {t('nav.privacy')}
              </button>
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.contactTitle')}</h2>
            <p className="text-muted-foreground">
              {t('mentions.contactText')}{' '}
              <a href={`mailto:${LEGAL_EMAIL}`} className="text-coral">{LEGAL_EMAIL}</a>
            </p>
          </section>

          {/* Droit applicable */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('mentions.applicableLawTitle')}</h2>
            <p className="text-muted-foreground">{t('mentions.applicableLawText')}</p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
