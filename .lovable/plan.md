

# Audit Multi-Roles - EASY v1.7.x (Iteration 11)

---

## Problemes identifies

### BUG-6 : Hooks avec toasts hardcodes en francais (HAUTE - visible par tous les utilisateurs)

3 hooks affichent des toasts en francais sans passer par le systeme i18n :

**`src/hooks/useRevealRateLimit.ts`** (L46) :
- `'Tu as atteint la limite de profils consultés. Réessaie dans 1h.'`

**`src/hooks/usePushNotifications.ts`** (L58, L68, L89, L94, L98, L119) :
- `'Les notifications ne sont pas supportées'`
- `'Permission de notification refusée'`
- `'Erreur lors de l'activation des notifications'`
- `'Notifications activées ! 🔔'`
- `'Erreur lors de l'activation'`
- `'Notifications désactivées'`

**`src/hooks/useNetworkStatus.ts`** (L18, L26) :
- `'Connexion rétablie !'`
- `'Pas de connexion internet'`

Ces hooks ne peuvent pas utiliser `useTranslation()` directement. Il faut utiliser le meme pattern que `useBinomeSessions.ts` (import direct des traductions + `getCurrentLocale()`).

### BUG-7 : `EmergencyButton.tsx` -- 100% hardcode en francais (HAUTE - composant de securite)

**Fichier** : `src/components/safety/EmergencyButton.tsx`

~7 textes hardcodes :
- L103 : `aria-label="Bouton d'alerte d'urgence - Maintenir pour activer"`
- L142 : `'Mode alerte activé'`
- L145 : `'Ta position GPS a été préparée pour être partagée.'`
- L155 : `'Appeler le 112'`
- L159 : `'En cas de danger réel, appelle immédiatement les secours.'`
- L166 : `'Alerte annulée'`
- L170 : `'Tout va bien, annuler'`

### BUG-8 : Admin components restants hardcodes (BASSE - admin only)

**`src/components/admin/AlertPreferencesCard.tsx`** (~12 textes) :
- L74 : `'Erreur lors de la sauvegarde'`
- L76 : `'Préférences sauvegardées'`
- L107-190 : titres, descriptions, labels de switch, bouton

**`src/components/admin/AlertHistoryCard.tsx`** (~6 textes + `Intl.DateTimeFormat('fr-FR')`) :
- L20-23 : labels de type d'alerte (`'Nouveau'`, `'Signalements'`, `'Erreurs'`)
- L51 : `'fr-FR'` hardcode
- L88 : `'Historique des alertes'`
- L91 : `'Les X dernières alertes envoyées'`
- L98 : `'Aucune alerte envoyée'`

**`src/components/admin/EventScraperCard.tsx`** (~15 textes) :
- L33, L40 : toasts hardcodes
- L56-59, L84, L94, L113-119, L137, L163, L168 : titres, labels, badges

### BUG-9 : `DiagnosticsPage.tsx` -- 100% hardcode en francais (BASSE - dev only)

**Fichier** : `src/pages/DiagnosticsPage.tsx`

~15 textes hardcodes. Page reservee aux developpeurs (`DEV ONLY`). Priorite la plus basse mais rompt la coherence.

---

## Plan de Corrections

### Etape 1 : i18n hooks -- useRevealRateLimit, usePushNotifications, useNetworkStatus (~10 cles)

Utiliser le pattern `getCurrentLocale()` + import direct des traductions (meme approche que `useBinomeSessions.ts`). Ajouter les cles dans `translations.ts` sous `hooks.*`.

### Etape 2 : i18n -- EmergencyButton (~7 cles)

Ajouter `emergency.*` dans `translations.ts`. Implementer `useTranslation()` dans le composant.

### Etape 3 : i18n -- AlertPreferencesCard + AlertHistoryCard + EventScraperCard (~30 cles)

Ajouter `adminAlerts.*`, `adminHistory.*`, `adminScraper.*` dans `translations.ts`. Implementer `useTranslation()`. Remplacer `'fr-FR'` hardcode par locale dynamique dans AlertHistoryCard.

### Etape 4 : i18n -- DiagnosticsPage (~15 cles)

Ajouter `diagnostics.*` dans `translations.ts`. Implementer `useTranslation()`.

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/lib/i18n/translations.ts` | +60 cles (hooks, emergency, adminAlerts, adminHistory, adminScraper, diagnostics) |
| `src/hooks/useRevealRateLimit.ts` | i18n toasts via import direct |
| `src/hooks/usePushNotifications.ts` | i18n toasts via import direct |
| `src/hooks/useNetworkStatus.ts` | i18n toasts via import direct |
| `src/components/safety/EmergencyButton.tsx` | i18n complet |
| `src/components/admin/AlertPreferencesCard.tsx` | i18n complet |
| `src/components/admin/AlertHistoryCard.tsx` | i18n + locale dynamique |
| `src/components/admin/EventScraperCard.tsx` | i18n complet |
| `src/pages/DiagnosticsPage.tsx` | i18n complet |

---

## Estimation

- i18n hooks (3 fichiers) : ~10 cles, ~20 lignes modifiees
- i18n EmergencyButton : ~7 cles, ~15 lignes
- i18n admin components (3 fichiers) : ~30 cles, ~80 lignes
- i18n DiagnosticsPage : ~15 cles, ~40 lignes
- Total : ~9 fichiers modifies, ~60 nouvelles cles, ~155 lignes modifiees

