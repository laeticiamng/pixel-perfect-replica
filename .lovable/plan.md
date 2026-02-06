

# Audit Multi-Roles - EASY v1.7.x (Iteration 10)

---

## Problemes identifies

### TECH-28 : `UserPopupCard.tsx` -- 100% hardcode en francais + locale `fr` (HAUTE)

**Fichier** : `src/components/map/UserPopupCard.tsx`

Composant visible par **tous les utilisateurs** quand ils cliquent sur un signal sur la carte. Textes hardcodes :
- L36-38 : `'Ouvert'`, `'Conditionnel'`, `'Occupé'` (labels de signal)
- L51-53 : `'Distance inconnue'`, `'Très proche !'` (formatage distance)
- L104 : `aria-label="Fermer"`
- L115 : `activity?.label || 'Autre'`
- L136 : `locale: fr` hardcode pour `formatDistanceToNow`
- L148 : `Voir le profil`

### TECH-29 : `SignalHistoryPanel.tsx` -- 100% hardcode en francais + locale `fr` (HAUTE)

**Fichier** : `src/components/map/SignalHistoryPanel.tsx`

~10 textes hardcodes :
- L21-28 : `activityLabels` map hardcode en francais (`'Réviser'`, `'Manger'`, `'Bosser'`...)
- L93 : `Historique`
- L100 : `Historique des signaux`
- L110-111 : `"Aucun historique"`, `"Tes signaux passés apparaîtront ici"`
- L128, L135 : `locale: fr` hardcode
- L157 : `Affichage des 20 derniers signaux`

### TECH-30 : `QRCodeScanner.tsx` -- 100% hardcode en francais (HAUTE)

**Fichier** : `src/components/events/QRCodeScanner.tsx`

~12 textes hardcodes :
- L28 : `"Impossible d'accéder à la caméra..."`
- L45 : `'Check-in réussi !'`
- L53 : `'Erreur lors du scan'`
- L54 : `'Erreur lors du check-in'`
- L62 : `'Erreur de la caméra'`
- L75 : `aria-label="Fermer"`
- L81 : `Scanner le QR Code`
- L84 : `Scanne le code de l'organisateur...`
- L124 : `Vérification...`
- L132 : `Check-in réussi !`
- L140 : `Erreur`
- L152 : `Caméra non disponible`
- L181 : `Annuler`
- L191 : `Réessayer`

### TECH-31 : `CronJobsMonitor.tsx` -- locale `fr` hardcode + textes admin (BASSE)

**Fichier** : `src/components/admin/CronJobsMonitor.tsx`

- L9, L314, L389 : `locale: fr` hardcode
- ~30 textes admin hardcodes (toasts, descriptions de jobs, historique)

### TECH-32 : `InteractiveMap.tsx` -- messages d'erreur hardcodes (MOYENNE)

**Fichier** : `src/components/map/InteractiveMap.tsx`

- L109, L120 : `'Session expirée, veuillez vous reconnecter'`

---

## Plan de Corrections

### Etape 1 : i18n -- `UserPopupCard.tsx` (~10 cles)

Ajouter `userPopup.*` dans `translations.ts`. Implementer `useTranslation()`. Ajouter locale dynamique pour `date-fns`.

### Etape 2 : i18n -- `SignalHistoryPanel.tsx` (~10 cles)

Ajouter `signalHistory.*` dans `translations.ts`. Supprimer le map `activityLabels` hardcode, utiliser les cles `activities.*` existantes. Ajouter locale dynamique.

### Etape 3 : i18n -- `QRCodeScanner.tsx` (~12 cles)

Ajouter `qrScanner.*` dans `translations.ts`. Implementer `useTranslation()`.

### Etape 4 : i18n -- `CronJobsMonitor.tsx` (locale dynamique + toasts, ~15 cles)

Ajouter `cronJobs.*` dans `translations.ts`. Remplacer `locale: fr` par locale dynamique. Traduire les toasts et les descriptions de jobs.

### Etape 5 : i18n -- `InteractiveMap.tsx` (messages d'erreur, ~2 cles)

Ajouter `map.sessionExpired` dans `translations.ts`. Remplacer les messages hardcodes.

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/lib/i18n/translations.ts` | +50 cles (userPopup, signalHistory, qrScanner, cronJobs, map) |
| `src/components/map/UserPopupCard.tsx` | i18n complet + locale dynamique |
| `src/components/map/SignalHistoryPanel.tsx` | i18n complet + locale dynamique |
| `src/components/events/QRCodeScanner.tsx` | i18n complet |
| `src/components/admin/CronJobsMonitor.tsx` | i18n + locale dynamique |
| `src/components/map/InteractiveMap.tsx` | i18n messages d'erreur |

---

## Estimation

- i18n composants Map (UserPopupCard, SignalHistoryPanel, InteractiveMap) : 3 fichiers, ~22 cles
- i18n QRCodeScanner : 1 fichier, ~12 cles
- i18n CronJobsMonitor : 1 fichier, ~15 cles
- Total : ~6 fichiers modifies, ~50 nouvelles cles, ~200 lignes modifiees
