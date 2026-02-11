import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { LEGAL_EMAIL } from '@/lib/constants';

export default function CGVPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sections = [
    { title: t('cgv.section1Title'), content: t('cgv.section1Text') },
    { title: t('cgv.section2Title'), content: t('cgv.section2Text'), items: [t('cgv.section2Item1'), t('cgv.section2Item2'), t('cgv.section2Item3')] },
    { title: t('cgv.section3Title'), content: t('cgv.section3Text') },
    { title: t('cgv.section4Title'), content: t('cgv.section4Text') },
    { title: t('cgv.section5Title'), content: t('cgv.section5Text') },
    { title: t('cgv.section6Title'), content: t('cgv.section6Text') },
    { title: t('cgv.section7Title'), content: t('cgv.section7Text') },
  ];

  return (
    <PageLayout showSidebar={false}>
      <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t('cgv.title')}</h1>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-muted/30">
            <CardContent className="p-6 space-y-6">
              <p className="text-muted-foreground text-sm">{t('cgv.lastUpdated')}</p>

              {sections.map((section, idx) => (
                <motion.section
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-3"
                >
                  <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                  <p className="text-muted-foreground">{section.content}</p>
                  {section.items && (
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                      {section.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </motion.section>
              ))}

              {/* Contact section */}
              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('cgv.section8Title')}</h2>
                <p className="text-muted-foreground">
                  {t('cgv.section8Text')}{' '}
                  <a href={`mailto:${LEGAL_EMAIL}`} className="text-coral hover:underline">{LEGAL_EMAIL}</a>
                </p>
              </section>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back */}
        <div className="text-center py-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('help.backToHome')}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
