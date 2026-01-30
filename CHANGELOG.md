# 📋 CHANGELOG - EASY App

Toutes les modifications notables du projet sont documentées dans ce fichier.

---

## [1.3.0] - 2026-01-30

### 🎉 Nouvelles Fonctionnalités

#### Mode Binôme Amélioré
- **Onboarding interactif** : Parcours en 5 étapes avec animations et confettis
- **Stats communautaires temps réel** : Affichage des utilisateurs actifs, sessions créées, rencontres réussies
- **Témoignages utilisateurs** : Formulaire de partage d'expérience post-session
- **Badge "New"** : Indicateur pour les utilisateurs n'ayant pas encore créé de session
- **Section "Pourquoi EASY ?"** : Mise en avant des bénéfices (amitié, cohésion, bien-être)

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
- **Footer** : Affichage "EASY v1.3.0 • Made with ❤️ in France par EmotionsCare Sasu"

#### Backend & Infrastructure
- **Cron job `hourly-cleanup-shadow-bans`** : Nettoyage automatique des shadow-bans expirés (toutes les heures)
- **Cron job `send-session-reminders`** : Rappels automatiques 1h et 15min avant les sessions
- **Synchronisation profils/stats** : Création automatique des entrées `user_settings` et `user_stats`

#### Documentation
- **README.md** : Mise à jour complète avec architecture cron jobs
- **SECURITY_ARCHITECTURE.md** : Documentation des politiques RLS
- **PLATFORM_AUDIT_FINAL.md** : Rapport d'audit complet

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

### 📊 Métriques

- **Tests** : 164 tests (100% passent)
- **Tables** : 25+ avec RLS activé
- **Fonctions SQL** : 40+
- **Edge Functions** : 8 déployées
- **Cron Jobs** : 3 actifs

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

### 🔧 Améliorations

- Rappels automatiques de session
- Notifications push améliorées
- Performance des requêtes optimisée

---

## [1.1.0] - 2026-01-20

### 🎉 Nouvelles Fonctionnalités

- **Radar temps réel** : Carte Mapbox avec signaux utilisateurs
- **3 états de signal** : Ouvert, Conditionnel, Occupé
- **6 activités** : Réviser, Manger, Bosser, Parler, Sport, Autre
- **Révélation progressive** : Profil complet à moins de 50m
- **Ghost Mode** : Invisibilité sur le radar
- **Bouton d'urgence** : Contacts d'urgence préenregistrés

### 🔒 Sécurité

- GPS Fuzzing (~100m de précision)
- Rate limiting reveals (10/heure)
- Rate limiting reports (5/heure)
- Shadow-ban automatique

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
  <strong>🟢 EASY</strong> — Le premier réseau social 100% réel<br>
  <em>Fait avec ❤️ in France par EmotionsCare Sasu</em>
</p>
