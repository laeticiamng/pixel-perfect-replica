import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { LEGAL_EMAIL } from '@/lib/constants';

export default function CookiePolicyPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          <h1 className="text-2xl font-bold">{t('cookiePolicy.title')}</h1>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-muted/30">
            <CardContent className="p-6 space-y-6">
              <p className="text-muted-foreground text-sm">{t('cookiePolicy.lastUpdated')}</p>

              {/* Intro */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.introTitle')}</h2>
                <p className="text-muted-foreground">{t('cookiePolicy.introText')}</p>
              </motion.section>

              {/* Essential cookies */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.essentialTitle')}</h2>
                <p className="text-muted-foreground">{t('cookiePolicy.essentialText')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>{t('cookiePolicy.essentialItem1')}</li>
                  <li>{t('cookiePolicy.essentialItem2')}</li>
                  <li>{t('cookiePolicy.essentialItem3')}</li>
                  <li>{t('cookiePolicy.essentialItem4')}</li>
                </ul>
              </motion.section>

              {/* Functional cookies */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.functionalTitle')}</h2>
                <p className="text-muted-foreground">{t('cookiePolicy.functionalText')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>{t('cookiePolicy.functionalItem1')}</li>
                  <li>{t('cookiePolicy.functionalItem2')}</li>
                </ul>
              </motion.section>

              {/* Analytics */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.analyticsTitle')}</h2>
                <p className="text-muted-foreground font-medium">{t('cookiePolicy.analyticsText')}</p>
              </motion.section>

              {/* Managing cookies */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.managingTitle')}</h2>
                <p className="text-muted-foreground">{t('cookiePolicy.managingText')}</p>
              </motion.section>

              {/* Contact */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('cookiePolicy.contactTitle')}</h2>
                <p className="text-muted-foreground">
                  {t('cookiePolicy.contactText')}{' '}
                  <a href={`mailto:${LEGAL_EMAIL}`} className="text-coral hover:underline">{LEGAL_EMAIL}</a>
                </p>
              </motion.section>
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
