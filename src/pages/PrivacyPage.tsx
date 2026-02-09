import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Shield } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { useTranslation } from '@/lib/i18n';

export default function PrivacyPage() {
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
        <h1 className="text-xl font-bold text-foreground">{t('privacy.title')}</h1>
      </header>

      <div className="px-6 space-y-6">
        <div className="glass rounded-xl p-6 space-y-4">
          <p className="text-muted-foreground text-sm">{t('privacy.lastUpdated')}</p>
          <p className="text-foreground">{t('privacy.intro')}</p>

          {/* Key Points */}
          <div className="grid gap-4 my-6">
            <div className="flex items-start gap-4 p-4 bg-signal-green/10 rounded-xl">
              <MapPin className="h-6 w-6 text-signal-green shrink-0" />
              <div>
                <p className="font-semibold text-foreground">{t('privacy.keyPositionTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('privacy.keyPositionText')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-coral/10 rounded-xl">
              <User className="h-6 w-6 text-coral shrink-0" />
              <div>
                <p className="font-semibold text-foreground">{t('privacy.keyMinimalTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('privacy.keyMinimalText')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-signal-yellow/10 rounded-xl">
              <Shield className="h-6 w-6 text-signal-yellow shrink-0" />
              <div>
                <p className="font-semibold text-foreground">{t('privacy.keyEncryptedTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('privacy.keyEncryptedText')}</p>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('privacy.section1Title')}</h2>
            <p className="text-muted-foreground">{t('privacy.section1Text')}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>{t('privacy.section1Item1')}</li>
              <li>{t('privacy.section1Item2')}</li>
              <li>{t('privacy.section1Item3')}</li>
              <li>{t('privacy.section1Item4')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('privacy.section2Title')}</h2>
            <p className="text-muted-foreground">{t('privacy.section2Text')}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>{t('privacy.section2Item1')}</li>
              <li>{t('privacy.section2Item2')}</li>
              <li>{t('privacy.section2Item3')}</li>
              <li>{t('privacy.section2Item4')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('privacy.section3Title')}</h2>
            <p className="text-muted-foreground">{t('privacy.section3Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('privacy.section4Title')}</h2>
            <p className="text-muted-foreground">{t('privacy.section4Text')}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>{t('privacy.section4Item1')}</li>
              <li>{t('privacy.section4Item2')}</li>
              <li>{t('privacy.section4Item3')}</li>
              <li>{t('privacy.section4Item4')}</li>
              <li>{t('privacy.section4Item5')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('privacy.section5Title')}</h2>
            <p className="text-muted-foreground">{t('privacy.section5Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('privacy.section6Title')}</h2>
            <p className="text-muted-foreground">{t('privacy.section6Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('privacy.section7Title')}</h2>
            <p className="text-muted-foreground">{t('privacy.section7Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('privacy.section8Title')}</h2>
            <p className="text-muted-foreground">{t('privacy.section8Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('privacy.section9Title')}</h2>
            <p className="text-muted-foreground">{t('privacy.section9Text')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('privacy.section10Title')}</h2>
            <p className="text-muted-foreground">
              {t('privacy.section10Text')}
              <a href="mailto:dpo@nearvity.fr" className="text-coral ml-1">dpo@nearvity.fr</a>
            </p>
            <p className="text-sm text-muted-foreground mt-2">{t('privacy.cnilNotice')}</p>
          </section>
        </div>

        <p className="text-center text-xs text-muted-foreground">{t('privacy.copyright')}</p>
      </div>
    </PageLayout>
  );
}
