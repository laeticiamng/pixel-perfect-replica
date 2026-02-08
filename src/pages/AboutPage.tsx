import { PageLayout } from '@/components/PageLayout';
import { useTranslation } from '@/lib/i18n';
import { ArrowLeft, Users, Heart, Shield, Rocket, Mail, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const values = [
    {
      icon: Heart,
      title: t('about.authenticity'),
      description: t('about.authenticityDesc'),
      gradient: 'from-coral to-coral-dark',
    },
    {
      icon: Shield,
      title: t('about.security'),
      description: t('about.securityDesc'),
      gradient: 'from-signal-green to-emerald-500',
    },
    {
      icon: Rocket,
      title: t('about.innovation'),
      description: t('about.innovationDesc'),
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Users,
      title: t('about.community'),
      description: t('about.communityDesc'),
      gradient: 'from-blue-500 to-cyan-500',
    },
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
          <h1 className="text-2xl font-bold">{t('about.title')}</h1>
        </header>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center">
            <span className="text-white font-bold text-3xl">N</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-coral to-coral-dark bg-clip-text text-transparent">
            {t('about.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t('about.subtitle')}
          </p>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="glass-card border-muted/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-coral" />
                {t('about.missionTitle')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.missionText')}
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Values Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-xl font-semibold mb-6 text-center">{t('about.valuesTitle')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="glass-card border-muted/30 h-full hover:border-coral/30 transition-colors">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-3`}>
                      <value.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold mb-2">{value.title}</h4>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="glass-card border-muted/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-coral" />
                {t('about.teamTitle')}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t('about.teamText')}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center">
                  <span className="text-white font-bold text-xs">EC</span>
                </div>
                <div>
                  <p className="font-medium">EmotionsCare SASU</p>
                  <p className="text-xs text-muted-foreground">France 🇫🇷</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="glass-card border-muted/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-coral" />
                {t('about.contactTitle')}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:support@nearvity.fr"
                  className="flex items-center gap-2 text-muted-foreground hover:text-coral transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  support@nearvity.fr
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Back Button */}
        <div className="text-center pb-8">
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
