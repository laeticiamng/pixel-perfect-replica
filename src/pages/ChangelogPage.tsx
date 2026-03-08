import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Shield, Wrench, Bug, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/BottomNav';
import { useTranslation } from '@/lib/i18n';
import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '@/lib/constants';
interface ChangelogEntry {
  version: string;
  date: string;
  sections: {
    type: 'new' | 'improved' | 'fixed' | 'security';
    items: { fr: string; en: string }[];
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: '2026-02-09',
    sections: [
      {
        type: 'new',
        items: [
          { fr: 'Système de connexions mutuelles (matching par activité + proximité)', en: 'Mutual connections system (activity + proximity matching)' },
          { fr: 'Messagerie éphémère 24h (auto-suppression RGPD)', en: 'Ephemeral 24h messaging (GDPR auto-deletion)' },
          { fr: 'Routes /signup et /login dédiées', en: 'Dedicated /signup and /login routes' },
          { fr: 'Table connections avec confirmation mutuelle', en: 'Connections table with mutual confirmation' },
          { fr: 'Rate limiting serveur sur les signaux (max 10/heure)', en: 'Server-side rate limiting on signals (max 10/hour)' },
          { fr: 'Hook useConnections pour le flux de matching', en: 'useConnections hook for matching flow' },
          { fr: 'Hook useSignalRateLimit pour la limitation côté client', en: 'useSignalRateLimit hook for client-side rate limiting' },
          { fr: 'Migration SQL complète : connections, signal_rate_limits, expires_at', en: 'Full SQL migration: connections, signal_rate_limits, expires_at' },
        ],
      },
      {
        type: 'improved',
        items: [
          { fr: 'SEO : alignement domaine canonical/OG/sitemap/robots.txt', en: 'SEO: canonical/OG/sitemap/robots.txt domain alignment' },
          { fr: 'Pages légales enrichies (CGU RGPD, Politique de confidentialité)', en: 'Enhanced legal pages (GDPR ToS, Privacy Policy)' },
          { fr: 'Changelog complet justifiant la version 2.0.0', en: 'Full changelog justifying version 2.0.0' },
          { fr: 'Hreflang x-default ajouté dans le sitemap', en: 'Hreflang x-default added to sitemap' },
          { fr: 'Types TypeScript mis à jour pour toutes les nouvelles tables', en: 'TypeScript types updated for all new tables' },
        ],
      },
      {
        type: 'fixed',
        items: [
          { fr: 'Domaine incohérent entre sitemap (nearvity.fr) et hébergement (lovable.app)', en: 'Inconsistent domain between sitemap (nearvity.fr) and hosting (lovable.app)' },
          { fr: 'Canonical URL pointant vers le mauvais domaine', en: 'Canonical URL pointing to wrong domain' },
          { fr: 'OG tags et JSON-LD avec URLs mixtes', en: 'OG tags and JSON-LD with mixed URLs' },
          { fr: 'Version 2.0.0 affichée sans changelog correspondant', en: 'Version 2.0.0 displayed without matching changelog' },
        ],
      },
      {
        type: 'security',
        items: [
          { fr: 'RLS activé sur la table connections', en: 'RLS enabled on connections table' },
          { fr: 'Rate limiting serveur (check_signal_rate_limit) côté PostgreSQL', en: 'Server-side rate limiting (check_signal_rate_limit) in PostgreSQL' },
          { fr: 'Nettoyage automatique des messages expirés (cleanup_expired_messages)', en: 'Automatic cleanup of expired messages (cleanup_expired_messages)' },
          { fr: 'Nettoyage automatique des connexions pendantes après 48h', en: 'Automatic cleanup of pending connections after 48h' },
          { fr: 'Politique de suppression éphémère (expires_at) sur les messages', en: 'Ephemeral deletion policy (expires_at) on messages' },
        ],
      },
    ],
  },
  {
    version: '1.7.0',
    date: '2026-02-06',
    sections: [
      {
        type: 'new',
        items: [
          { fr: 'Connexion Apple Sign-In', en: 'Apple Sign-In authentication' },
          { fr: 'Refactorisation complète du code (composants modulaires)', en: 'Full code refactoring (modular components)' },
          { fr: 'Audit UX et corrections de bugs', en: 'UX audit and bug fixes' },
        ],
      },
      {
        type: 'improved',
        items: [
          { fr: 'Landing page refactorisée en 12 composants', en: 'Landing page refactored into 12 components' },
          { fr: 'SessionChat optimisé avec hook dédié', en: 'SessionChat optimized with dedicated hook' },
          { fr: 'Traductions FR/EN complètes (bannière cookies, Apple)', en: 'Full FR/EN translations (cookie banner, Apple)' },
        ],
      },
      {
        type: 'fixed',
        items: [
          { fr: 'Bouton Apple affichait une clé de traduction', en: 'Apple button displayed a translation key' },
          { fr: 'Incohérence de numéro de version', en: 'Version number inconsistency' },
          { fr: 'Bannière cookies non traduite', en: 'Cookie banner not translated' },
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
          { fr: 'Optimisations de performance', en: 'Performance optimizations' },
          { fr: 'Amélioration de la stabilité', en: 'Stability improvements' },
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
          { fr: 'Mode Binôme amélioré avec onboarding interactif en 5 étapes', en: 'Enhanced Buddy Mode with 5-step interactive onboarding' },
          { fr: 'Stats communautaires en temps réel', en: 'Real-time community stats' },
          { fr: 'Témoignages utilisateurs post-session', en: 'Post-session user testimonials' },
          { fr: 'Badge "New" pour les nouveaux utilisateurs', en: '"New" badge for new users' },
          { fr: 'Section "Pourquoi NEARVITY ?" sur la page Binôme', en: '"Why NEARVITY?" section on Buddy page' },
          { fr: 'Sélecteur de styles de carte (Satellite, Rues, Navigation, Plein air)', en: 'Map style selector (Satellite, Streets, Navigation, Outdoors)' },
          { fr: 'Mode démo sur la carte avec utilisateurs fictifs', en: 'Demo mode on map with mock users' },
          { fr: 'Dashboard admin pour monitorer les cron jobs', en: 'Admin dashboard to monitor cron jobs' },
        ],
      },
      {
        type: 'improved',
        items: [
          { fr: 'Animations fluides sur la carte et les filtres', en: 'Smooth animations on map and filters' },
          { fr: 'Navigation bottom cohérente sur toutes les pages', en: 'Consistent bottom navigation across all pages' },
          { fr: 'Traductions FR/EN complètes', en: 'Full FR/EN translations' },
          { fr: 'Footer avec version et crédit EmotionsCare', en: 'Footer with version and EmotionsCare credit' },
        ],
      },
      {
        type: 'fixed',
        items: [
          { fr: 'OfflineBanner avec forwardRef pour compatibilité React', en: 'OfflineBanner with forwardRef for React compatibility' },
          { fr: 'Mode démo activé uniquement sans utilisateur réel', en: 'Demo mode enabled only without real user' },
          { fr: 'Traductions manquantes en anglais', en: 'Missing English translations' },
        ],
      },
      {
        type: 'security',
        items: [
          { fr: 'RLS sur user_reliability (scores non-modifiables)', en: 'RLS on user_reliability (non-editable scores)' },
          { fr: 'Validation JWT sur toutes les Edge Functions', en: 'JWT validation on all Edge Functions' },
          { fr: 'Cron job hourly pour nettoyage shadow-bans', en: 'Hourly cron job for shadow-ban cleanup' },
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
          { fr: 'Mode Binôme : sessions planifiées', en: 'Buddy Mode: scheduled sessions' },
          { fr: 'Système de check-in/check-out GPS', en: 'GPS check-in/check-out system' },
          { fr: 'Chat de groupe en temps réel', en: 'Real-time group chat' },
          { fr: 'Feedback post-session avec 3 critères', en: 'Post-session feedback with 3 criteria' },
          { fr: 'Score de fiabilité utilisateur', en: 'User reliability score' },
          { fr: 'Quota mensuel (2 sessions gratuites)', en: 'Monthly quota (2 free sessions)' },
          { fr: 'Mode Événement avec QR Code check-in', en: 'Event Mode with QR Code check-in' },
          { fr: 'Page Premium avec intégration Stripe', en: 'Premium page with Stripe integration' },
        ],
      },
      {
        type: 'improved',
        items: [
          { fr: 'Rappels automatiques de session', en: 'Automatic session reminders' },
          { fr: 'Notifications push améliorées', en: 'Improved push notifications' },
          { fr: 'Performance des requêtes optimisée', en: 'Optimized query performance' },
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
          { fr: 'Radar temps réel avec carte Mapbox', en: 'Real-time radar with Mapbox map' },
          { fr: '3 états de signal : Ouvert, Conditionnel, Occupé', en: '3 signal states: Open, Conditional, Busy' },
          { fr: '6 activités : Réviser, Manger, Bosser, Parler, Sport, Autre', en: '6 activities: Study, Eat, Work, Talk, Sport, Other' },
          { fr: 'Révélation progressive (profil complet à -50m)', en: 'Progressive reveal (full profile at <50m)' },
          { fr: 'Ghost Mode pour invisibilité', en: 'Ghost Mode for invisibility' },
          { fr: "Bouton d'urgence avec contacts préenregistrés", en: 'Emergency button with pre-saved contacts' },
        ],
      },
      {
        type: 'security',
        items: [
          { fr: 'GPS Fuzzing (~100m de précision)', en: 'GPS Fuzzing (~100m precision)' },
          { fr: 'Rate limiting : 10 reveals/heure, 5 reports/heure', en: 'Rate limiting: 10 reveals/hour, 5 reports/hour' },
          { fr: 'Shadow-ban automatique après 3 signalements', en: 'Automatic shadow-ban after 3 reports' },
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
          { fr: 'PWA installable (iOS + Android)', en: 'Installable PWA (iOS + Android)' },
          { fr: 'Authentification email/password', en: 'Email/password authentication' },
          { fr: 'Profil utilisateur avec avatar', en: 'User profile with avatar' },
          { fr: 'Paramètres : thème, notifications, confidentialité', en: 'Settings: theme, notifications, privacy' },
          { fr: 'Export GDPR des données personnelles', en: 'GDPR personal data export' },
          { fr: 'Suppression de compte avec cascade', en: 'Account deletion with cascade' },
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
    <PageLayout className="pb-24 safe-bottom">
      <Helmet>
        <title>{locale === 'fr' ? 'Journal des mises à jour — NEARVITY' : 'Changelog — NEARVITY'}</title>
        <meta name="description" content={locale === 'fr'
          ? 'Historique des mises à jour de NEARVITY : nouvelles fonctionnalités, améliorations, corrections de bugs et sécurité.'
          : 'NEARVITY update history: new features, improvements, bug fixes and security updates.'
        } />
        <link rel="canonical" href={`${SITE_URL}/changelog`} />
        <meta property="og:title" content={locale === 'fr' ? 'Changelog — NEARVITY' : 'Changelog — NEARVITY'} />
        <meta property="og:url" content={`${SITE_URL}/changelog`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'NEARVITY', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Changelog', item: `${SITE_URL}/changelog` },
          ],
        })}</script>
      </Helmet>
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
                    {new Date(entry.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US', {
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
                      <ul className="space-y-1.5 pl-4">
                        {section.items.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-coral mt-1.5">•</span>
                            <span>{locale === 'fr' ? item.fr : item.en}</span>
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
