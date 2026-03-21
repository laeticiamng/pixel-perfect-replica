# 📋 CHANGELOG - NEARVITY App

Toutes les modifications notables du projet sont documentées dans ce fichier.

---

## [Unreleased]

### ✅ Correctifs QA & fiabilité
- Auth: distinction explicite des erreurs mot de passe compromis (`pwned`) vs mot de passe faible (`weak_password`) avec messages UI dédiés et exigences détaillées.
- PWA: ajout d'un `public/manifest.webmanifest` statique pour éviter les erreurs de résolution en preview.
- Rebranding/Support: centralisation des emails de contact sur la boîte vérifiée `contact@emotionscare.com`.
- Checkout Edge Function: rétrocompatibilité temporaire des plans legacy `easyplus` -> `nearvityplus` (fin de support prévue: 2026-06-30).

---

## [2.0.0] - 2026-02-06

### 🎉 Publication Officielle

#### Branding Premium
- **100% icônes vectorielles** : Zéro emoji restant dans toute l'application (Landing, CookieConsent, SignalDemo, AppPreview)
- **Header glassmorphism** : Navigation transparente avec backdrop-blur premium
- **SocialProofBar** : Conteneur glass avec séparateurs verticaux entre les statistiques
- **CTA optimisés** : Suppression des animations pulsantes, gradients subtils

#### Corrections Finales
- **CookieConsent** : Emoji 🍪 remplacé par icône Lucide `Shield`
- **CookieConsent** : Lien `<a>` remplacé par React Router `<Link>` (préservation SPA)
- **SocialProofBar** : Structure JSX simplifiée (séparateurs entre items, pas à l'intérieur)
- **SEO** : Meta tags `description`, `og:title`, `og:description`, `og:image` vérifiés et optimisés

#### Sécurité & Conformité
- Zéro issue au linter DB
- RLS active sur toutes les tables
- JWT validé dans toutes les edge functions
- Cookie consent RGPD avec accept/decline
- Export de données GDPR disponible
- Politique de confidentialité avec contact DPO

---

## [1.7.0] - 2026-02-05

### 🔧 Améliorations
- Audit visuel v2 : remplacement des emojis résiduels dans AppPreviewSection, SignalDemo, HeroSection
- SocialProofBar : ajout fond glass et séparateurs visuels

---

## [1.3.0] - 2026-01-30

### 🎉 Nouvelles Fonctionnalités

#### Mode Binôme Amélioré
- **Onboarding interactif** : Parcours en 5 étapes avec animations et confettis
- **Stats communautaires temps réel** : Affichage des utilisateurs actifs, sessions créées, rencontres réussies
- **Témoignages utilisateurs** : Formulaire de partage d'expérience post-session
- **Badge "New"** : Indicateur pour les utilisateurs n'ayant pas encore créé de session
- **Section "Pourquoi NEARVITY ?"** : Mise en avant des bénéfices (amitié, cohésion, bien-être)

#### Carte Interactive
- **Mode démo** : Génération d'utilisateurs fictifs si aucun signal réel détecté (badge jaune visible)
- **Sélecteur de styles** : 4 styles de carte (Satellite, Rues, Navigation, Plein air)
- **Animations fluides** : Transitions et mouvements de markers améliorés
- **Filtres par activité** : Animations lors du changement de filtre

#### Sécurité Renforcée
- **RLS sur `user_reliability`** : Scores de fiabilité non-modifiables par les utilisateurs
- **Edge Functions sécurisées** : Validation JWT sur toutes les actions sensibles
- **Matrice d'autorisation** : Documentation complète des permissions par action

### 🔧 Améliorations

#### Interface Utilisateur
- **OfflineBanner** : Correction du forwardRef pour compatibilité React
- **BottomNav** : Affichage sur toutes les pages protégées
- **Traductions** : Couverture FR/EN complète
- **Footer** : Affichage "NEARVITY v2.0.0 • Made with ❤️ in France par EmotionsCare Sasu"

#### Backend & Infrastructure
- **Cron job `hourly-cleanup-shadow-bans`** : Nettoyage automatique des shadow-bans expirés (toutes les heures)
- **Cron job `send-session-reminders`** : Rappels automatiques 1h et 15min avant les sessions
- **Synchronisation profils/stats** : Création automatique des entrées `user_settings` et `user_stats`

### 🐛 Corrections

- Fix: OfflineBanner avec forwardRef pour éviter les warnings React
- Fix: Navigation bottom sur toutes les pages (cohérence mobile)
- Fix: Traductions manquantes en anglais
- Fix: Mode démo activé uniquement quand aucun utilisateur réel détecté

### 🔒 Sécurité

| Catégorie | Status |
|-----------|--------|
| Smoke Tests | ✅ 28/28 |
| Security Tests | ✅ 17/17 |
| RLS Permissions | ✅ 31/31 |
| Edge Functions | ✅ JWT + Admin validation |

---

## [1.2.0] - 2026-01-28

### 🎉 Nouvelles Fonctionnalités

#### Mode Binôme
- Création de sessions planifiées
- Système de check-in/check-out GPS
- Chat de groupe en temps réel
- Feedback post-session
- Score de fiabilité
- Quota mensuel (2 sessions gratuites)

#### Mode Événement
- Création d'événements locaux
- QR Code check-in sécurisé
- Gestion des participants
- Scanner de caméra intégré

#### Premium
- Page de tarification
- Intégration Stripe Checkout
- Sessions supplémentaires achetables

---

## [1.1.0] - 2026-01-20

### 🎉 Nouvelles Fonctionnalités

- **Radar temps réel** : Carte Mapbox avec signaux utilisateurs
- **3 états de signal** : Ouvert, Conditionnel, Occupé
- **6 activités** : Réviser, Manger, Bosser, Parler, Sport, Autre
- **Révélation progressive** : Profil complet à moins de 50m
- **Ghost Mode** : Invisibilité sur le radar
- **Bouton d'urgence** : Contacts d'urgence préenregistrés

---

## [1.0.0] - 2026-01-15

### 🎉 Lancement Initial

- **PWA installable** (iOS + Android)
- **Authentification** email/password
- **Profil utilisateur** avec avatar
- **Paramètres** thème, notifications, confidentialité
- **Export GDPR** des données personnelles
- **Suppression de compte** avec cascade

---

<p align="center">
  <strong>🟢 NEARVITY</strong> — L'app des rencontres spontanées entre étudiants<br>
  <em>Fait avec ❤️ in France par EmotionsCare Sasu</em>
</p>
