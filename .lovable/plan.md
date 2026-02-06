

# Audit Multi-Roles - EASY v1.7.x (Iteration 12)

---

## Problemes identifies

### BUG-10 : `CommandPalette.tsx` -- 100% hardcode en francais (~20 labels) (HAUTE)

**Fichier** : `src/components/CommandPalette.tsx`

Composant accessible via `Ctrl+K` par tous les utilisateurs. ~20 labels hardcodes :
- L74-127 : Navigation labels (`'Accueil'`, `'Carte / Radar'`, `'Mon Profil'`, `'Binôme'`, `'Événements'`, `'Statistiques'`, `'Personnes rencontrées'`)
- L133-178 : Settings labels (`'Paramètres'`, `'Confidentialité'`, `'Changer le mot de passe'`, `'Utilisateurs bloqués'`, `'Exporter mes données'`)
- L184-213 : Action labels (`'Mode clair'`/`'Mode sombre'`, `'Aide'`, `'Donner un avis'`, `'Déconnexion'`)
- L223 : `"Rechercher une page ou une action..."`
- L225 : `"Aucun résultat trouvé."`
- L229, L245, L263 : Group headings (`'Navigation'`, `'Paramètres'`, `'Actions'`)

### BUG-11 : `MapHeader.tsx` -- 100% hardcode en francais (~15 textes) (CRITIQUE)

**Fichier** : `src/components/map/MapHeader.tsx`

Composant visible en permanence sur la carte. Textes hardcodes :
- L62 : `'Tu es visible'` / `'Signal désactivé'`
- L89 : `aria-label="Rafraîchir la carte"`
- L106-114 : Legend labels (`'Ouvert'`, `'Conditionnel'`, `'Toi'`)
- L122 : `aria-label` filtres
- L135 : `'personne ouverte'`/`'personnes ouvertes'`
- L138 : `'Démo'`
- L145 : `aria-label` legende
- L177 : `"Tout le monde ici est ouvert à l'interaction"`
- L182-194 : Legend descriptions
- L197 : `"Distance: 200m • Rafraîchissement: 30s"`

### BUG-12 : `ActivityModal.tsx` -- 100% hardcode en francais (~5 textes) (HAUTE)

**Fichier** : `src/components/map/ActivityModal.tsx`

Modal d'activation de signal. Textes hardcodes :
- L34 : `"Tu es ouvert·e à..."`
- L35 : `"Signale que tu veux faire ça avec quelqu'un"`
- L55 : `"Où es-tu ? (optionnel)"`
- L68 : `'Annuler'`
- L75 : `'Activation...'`/`'Confirmer'`

### BUG-13 : `Breadcrumbs.tsx` -- 100% hardcode en francais (~15 labels) (HAUTE)

**Fichier** : `src/components/Breadcrumbs.tsx`

Fil d'Ariane visible sur toutes les pages internes. ~15 labels route hardcodes :
- L13-30 : `ROUTE_CONFIG` avec `'Accueil'`, `'Carte'`, `'Profil'`, `'Paramètres'`, `'Modifier le profil'`, `'Statistiques'`, `'Personnes rencontrées'`, `'Aide & FAQ'`, etc.
- L48-53 : `'Profil utilisateur'`, `'Carte'` pour routes dynamiques
- L79 : `aria-label="Fil d'Ariane"`
- L87 : `aria-label="Accueil"`

### BUG-14 : `ExpirationTimer.tsx` -- 2 textes hardcodes (MOYENNE)

**Fichier** : `src/components/radar/ExpirationTimer.tsx`

- L38 : `'Expiré'`
- L93 : `'Prolonger'`

### BUG-15 : `EventFavoriteButton.tsx` -- aria-labels hardcodes (BASSE)

**Fichier** : `src/components/events/EventFavoriteButton.tsx`

- L42 : `aria-label` = `'Retirer des favoris'`/`'Ajouter aux favoris'`

### BUG-16 : `AdminDashboardPage.tsx` L144 -- `'fr-FR'` hardcode restant (BASSE)

**Fichier** : `src/pages/AdminDashboardPage.tsx`

- L144 : `toLocaleDateString('fr-FR', ...)` -- manque dans l'iteration precedente

### BUG-17 : `DeleteAccountDialog.tsx` -- `dangerouslySetInnerHTML` (SECURITE)

**Fichier** : `src/components/DeleteAccountDialog.tsx`

- L79, L84 : Utilise `dangerouslySetInnerHTML` pour afficher du texte traduit. Risque XSS selon les standards du projet (`xss-prevention-standard`). Doit etre remplace par du rendu React securise.

---

## Plan de Corrections

### Etape 1 : i18n -- `CommandPalette.tsx` (~20 cles)

Ajouter `commandPalette.*` dans `translations.ts`. Implementer `useTranslation()`. Traduire tous les labels, placeholder et headings.

### Etape 2 : i18n -- `MapHeader.tsx` + `MapLegend` (~15 cles)

Ajouter `mapHeader.*` dans `translations.ts`. Implementer `useTranslation()`. Traduire signal status, legend, compteur de personnes, aria-labels.

### Etape 3 : i18n -- `ActivityModal.tsx` (~5 cles)

Ajouter `activityModal.*` dans `translations.ts`. Implementer `useTranslation()`.

### Etape 4 : i18n -- `Breadcrumbs.tsx` (~15 cles)

Ajouter `breadcrumbs.*` dans `translations.ts`. Implementer `useTranslation()`. Traduire `ROUTE_CONFIG` et `aria-label`.

### Etape 5 : i18n -- `ExpirationTimer.tsx` (~2 cles)

Ajouter `timer.expired` et `timer.extend` dans `translations.ts`. Implementer `useTranslation()`.

### Etape 6 : Corrections mineures

- `EventFavoriteButton.tsx` : i18n aria-labels (2 cles)
- `AdminDashboardPage.tsx` L144 : remplacer `'fr-FR'` par `locale === 'fr' ? 'fr-FR' : 'en-US'`
- `DeleteAccountDialog.tsx` : remplacer `dangerouslySetInnerHTML` par du rendu React securise

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/lib/i18n/translations.ts` | +60 cles (commandPalette, mapHeader, activityModal, breadcrumbs, timer, favorites) |
| `src/components/CommandPalette.tsx` | i18n complet |
| `src/components/map/MapHeader.tsx` | i18n complet |
| `src/components/map/ActivityModal.tsx` | i18n complet |
| `src/components/Breadcrumbs.tsx` | i18n complet |
| `src/components/radar/ExpirationTimer.tsx` | i18n (2 cles) |
| `src/components/events/EventFavoriteButton.tsx` | i18n aria-labels |
| `src/pages/AdminDashboardPage.tsx` | fix locale L144 |
| `src/components/DeleteAccountDialog.tsx` | securite XSS |

---

## Estimation

- i18n CommandPalette : ~20 cles, ~40 lignes
- i18n MapHeader : ~15 cles, ~35 lignes
- i18n ActivityModal : ~5 cles, ~10 lignes
- i18n Breadcrumbs : ~15 cles, ~30 lignes
- i18n ExpirationTimer + EventFavoriteButton : ~4 cles, ~10 lignes
- Fix locale AdminDashboard + XSS DeleteAccount : ~10 lignes
- Total : ~9 fichiers modifies, ~60 nouvelles cles, ~135 lignes modifiees
