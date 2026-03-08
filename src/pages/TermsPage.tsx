import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { useTranslation } from '@/lib/i18n';
import { LEGAL_EMAIL, SITE_URL } from '@/lib/constants';
import { Helmet } from 'react-helmet-async';

export default function TermsPage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();

  return (
    <PageLayout showSidebar={false} className="pb-8 safe-bottom">
      <Helmet>
        <title>{locale === 'fr' ? 'Conditions Générales d\'Utilisation — NEARVITY' : 'Terms of Service — NEARVITY'}</title>
        <meta name="description" content={locale === 'fr'
          ? 'Conditions générales d\'utilisation de NEARVITY, le réseau social IRL. Règles d\'utilisation, politique de confidentialité, droits RGPD.'
          : 'NEARVITY terms of service — the IRL social network. Usage rules, privacy policy, GDPR rights.'
        } />
        <link rel="canonical" href={`${SITE_URL}/terms`} />
        <meta property="og:title" content={locale === 'fr' ? 'CGU — NEARVITY' : 'Terms — NEARVITY'} />
        <meta property="og:url" content={`${SITE_URL}/terms`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'NEARVITY', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: locale === 'fr' ? 'CGU' : 'Terms', item: `${SITE_URL}/terms` },
          ],
        })}</script>
      </Helmet>

      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <Link
          to="/"
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label={t('help.backToHome')}
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </Link>
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
            <p className="text-muted-foreground">{t('terms.section8Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('terms.section9Title')}</h2>
            <p className="text-muted-foreground">{t('terms.section9Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('terms.section10Title')}</h2>
            <p className="text-muted-foreground">{t('terms.section10Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('terms.section11Title')}</h2>
            <p className="text-muted-foreground">
              {t('terms.section11Text')}
              <a href={`mailto:${LEGAL_EMAIL}`} rel="noopener noreferrer" className="text-coral ml-1">{LEGAL_EMAIL}</a>
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-4">{t('terms.editorInfo')}</p>
        </div>

        <p className="text-center text-xs text-muted-foreground">{t('terms.copyright')}</p>
      </div>
    </PageLayout>
  );
}
