import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Shield, Wrench, Bug, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/BottomNav';
import { useTranslation } from '@/lib/i18n';

interface ChangelogEntry {
  version: string;
  date: string;
  sections: {
    type: 'new' | 'improved' | 'fixed' | 'security';
    items: string[];
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.7.0',
    date: '2026-02-06',
    sections: [
      {
        type: 'new',
        items: [
          'Connexion Apple Sign-In',
          'Refactorisation complète du code (composants modulaires)',
          'Audit UX et corrections de bugs',
        ],
      },
      {
        type: 'improved',
        items: [
          'Landing page refactorisée en 12 composants',
          'SessionChat optimisé avec hook dédié',
          'Traductions FR/EN complètes (bannière cookies, Apple)',
        ],
      },
      {
        type: 'fixed',
        items: [
          'Bouton Apple affichait une clé de traduction',
          'Incohérence de numéro de version',
          'Bannière cookies non traduite',
        ],
      },
    ],
  },
  {
    version: '1.6.5',
    date: '2026-02-04',
    sections: [
      {
        type: 'improved',
        items: [
          'Optimisations de performance',
          'Amélioration de la stabilité',
        ],
      },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-01-30',
    sections: [
      {
        type: 'new',
        items: [
          'Mode Binôme amélioré avec onboarding interactif en 5 étapes',
          'Stats communautaires en temps réel',
          'Témoignages utilisateurs post-session',
          'Badge "New" pour les nouveaux utilisateurs',
          'Section "Pourquoi NEARVITY ?" sur la page Binôme',
          'Sélecteur de styles de carte (Satellite, Rues, Navigation, Plein air)',
          'Mode démo sur la carte avec utilisateurs fictifs',
          'Dashboard admin pour monitorer les cron jobs',
        ],
      },
      {
        type: 'improved',
        items: [
          'Animations fluides sur la carte et les filtres',
          'Navigation bottom cohérente sur toutes les pages',
          'Traductions FR/EN complètes',
          'Footer avec version et crédit EmotionsCare',
        ],
      },
      {
        type: 'fixed',
        items: [
          'OfflineBanner avec forwardRef pour compatibilité React',
          'Mode démo activé uniquement sans utilisateur réel',
          'Traductions manquantes en anglais',
        ],
      },
      {
        type: 'security',
        items: [
          'RLS sur user_reliability (scores non-modifiables)',
          'Validation JWT sur toutes les Edge Functions',
          'Cron job hourly pour nettoyage shadow-bans',
        ],
      },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-01-28',
    sections: [
      {
        type: 'new',
        items: [
          'Mode Binôme : sessions planifiées',
          'Système de check-in/check-out GPS',
          'Chat de groupe en temps réel',
          'Feedback post-session avec 3 critères',
          'Score de fiabilité utilisateur',
          'Quota mensuel (2 sessions gratuites)',
          'Mode Événement avec QR Code check-in',
          'Page Premium avec intégration Stripe',
        ],
      },
      {
        type: 'improved',
        items: [
          'Rappels automatiques de session',
          'Notifications push améliorées',
          'Performance des requêtes optimisée',
        ],
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-01-20',
    sections: [
      {
        type: 'new',
        items: [
          'Radar temps réel avec carte Mapbox',
          '3 états de signal : Ouvert, Conditionnel, Occupé',
          '6 activités : Réviser, Manger, Bosser, Parler, Sport, Autre',
          'Révélation progressive (profil complet à -50m)',
          'Ghost Mode pour invisibilité',
          'Bouton d\'urgence avec contacts préenregistrés',
        ],
      },
      {
        type: 'security',
        items: [
          'GPS Fuzzing (~100m de précision)',
          'Rate limiting : 10 reveals/heure, 5 reports/heure',
          'Shadow-ban automatique après 3 signalements',
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-01-15',
    sections: [
      {
        type: 'new',
        items: [
          'PWA installable (iOS + Android)',
          'Authentification email/password',
          'Profil utilisateur avec avatar',
          'Paramètres : thème, notifications, confidentialité',
          'Export GDPR des données personnelles',
          'Suppression de compte avec cascade',
        ],
      },
    ],
  },
];

const sectionConfig = {
  new: {
    icon: Sparkles,
    label: 'Nouveautés',
    labelEn: 'New Features',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  improved: {
    icon: Wrench,
    label: 'Améliorations',
    labelEn: 'Improvements',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  fixed: {
    icon: Bug,
    label: 'Corrections',
    labelEn: 'Bug Fixes',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  security: {
    icon: Shield,
    label: 'Sécurité',
    labelEn: 'Security',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
};

export default function ChangelogPage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t('changelog.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('changelog.updateHistory')}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {changelog.map((entry, index) => (
          <motion.div
            key={entry.version}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-coral">
                    v{entry.version}
                  </CardTitle>
                  <Badge variant="outline" className="gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(entry.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {entry.sections.map((section) => {
                  const config = sectionConfig[section.type];
                  const Icon = config.icon;
                  return (
                    <div key={section.type} className="space-y-2">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                        <Icon className="h-4 w-4" />
                        {locale === 'fr' ? config.label : (config.labelEn || config.label)}
                      </div>
                      {locale !== 'fr' && (
                        <p className="text-xs text-muted-foreground italic mb-1">{t('changelog.frenchOnly')}</p>
                      )}
                      <ul className="space-y-1.5 pl-4">
                        {section.items.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-coral mt-1.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p><span className="w-3 h-3 rounded-full bg-signal-green inline-block mr-1 align-middle" /> {t('changelog.tagline')}</p>
          <p className="mt-1">{t('changelog.madeWith')}</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
