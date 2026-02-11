import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { LEGAL_EMAIL } from '@/lib/constants';

export default function MentionsLegalesPage() {
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
          <h1 className="text-2xl font-bold">{t('mentions.title')}</h1>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-muted/30">
            <CardContent className="p-6 space-y-6">
              {/* Editeur */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('mentions.editorTitle')}</h2>
                <p className="text-muted-foreground">{t('mentions.editorText')}</p>
                <ul className="text-muted-foreground space-y-2 ml-4">
                  <li><strong>{t('mentions.companyName')} :</strong> EmotionsCare SASU</li>
                  <li><strong>{t('mentions.companyForm')} :</strong> {t('mentions.companyFormValue')}</li>
                  <li><strong>{t('mentions.registeredOffice')} :</strong> {t('mentions.registeredOfficeValue')}</li>
                </ul>
              </motion.section>

              {/* Directeur de publication */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('mentions.directorTitle')}</h2>
                <p className="text-muted-foreground">{t('mentions.directorValue')}</p>
              </motion.section>

              {/* Hébergement */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('mentions.hostingTitle')}</h2>
                <p className="text-muted-foreground">{t('mentions.hostingText')}</p>
                <p className="text-muted-foreground font-medium">{t('mentions.hostingProvider')}</p>
              </motion.section>

              {/* Propriété intellectuelle */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('mentions.intellectualPropertyTitle')}</h2>
                <p className="text-muted-foreground">{t('mentions.intellectualPropertyText')}</p>
              </motion.section>

              {/* Données personnelles */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-3">
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
              </motion.section>

              {/* Contact */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('mentions.contactTitle')}</h2>
                <p className="text-muted-foreground">
                  {t('mentions.contactText')}{' '}
                  <a href={`mailto:${LEGAL_EMAIL}`} className="text-coral hover:underline">{LEGAL_EMAIL}</a>
                </p>
              </motion.section>

              {/* Droit applicable */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('mentions.applicableLawTitle')}</h2>
                <p className="text-muted-foreground">{t('mentions.applicableLawText')}</p>
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
