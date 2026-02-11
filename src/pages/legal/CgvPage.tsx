import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { useTranslation } from '@/lib/i18n';
import { LEGAL_EMAIL } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export default function CgvPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sections = [
    { title: t('cgv.preambleTitle'), text: t('cgv.preambleText') },
    { title: t('cgv.serviceTitle'), text: t('cgv.serviceText') },
    { title: t('cgv.freeServiceTitle'), text: t('cgv.freeServiceText') },
    { title: t('cgv.premiumTitle'), text: t('cgv.premiumText') },
    { title: t('cgv.accountTitle'), text: t('cgv.accountText') },
    { title: t('cgv.obligationsTitle'), text: t('cgv.obligationsText') },
    { title: t('cgv.terminationTitle'), text: t('cgv.terminationText') },
    { title: t('cgv.liabilityTitle'), text: t('cgv.liabilityText') },
    { title: t('cgv.lawTitle'), text: t('cgv.lawText') },
  ];

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
        <div className="glass rounded-xl p-6 space-y-6">
          <p className="text-muted-foreground text-sm">{t('cgv.lastUpdated')}</p>

          {sections.map((section, index) => (
            <section key={index} className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                {index + 1}. {section.title}
              </h2>
              <p className="text-muted-foreground">{section.text}</p>
            </section>
          ))}

          <section className="space-y-3 pt-4 border-t border-muted/30">
            <p className="text-sm text-muted-foreground">
              EmotionsCare SASU — <a href={`mailto:${LEGAL_EMAIL}`} className="text-coral">{LEGAL_EMAIL}</a>
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
