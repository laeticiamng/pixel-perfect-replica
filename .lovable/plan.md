
# Audit Triple - EASY v1.7.x (Iteration 5)
## Phase 1 : Technique | Phase 2 : UX | Phase 3 : Beta-testeur

---

## PHASE 1 : Audit Technique (Dev Senior)

### TECH-01 : Pages 100% hardcodees en francais (CRITIQUE)

Les 4 audits precedents ont corrige ~20 pages mais les suivantes restent entierement hardcodees :

| Page | Textes hardcodes (echantillon) |
|------|-------------------------------|
| **FeedbackPage.tsx** | "Choisis une note d'abord !", "Erreur lors de l'envoi", "Merci pour ton feedback !", "Donner un feedback", "Comment trouves-tu EASY ?", "Ton avis nous aide", "Un commentaire ? (optionnel)", "Envoyer mon feedback" |
| **ReportPage.tsx** | "Bug technique", "Comportement inapproprie", "Contenu offensant", "Autre probleme", "Choisis un type de signalement", "Decris le probleme", "Envoyer le signalement", "Signalement envoye !", "Ton signalement sera traite..." |
| **InstallPage.tsx** | "Installer EASY", "Application Web Progressive", "Retour a l'application", "Installation reussie !", "Installer EASY maintenant", toutes les instructions iOS/Android/Desktop (~40 textes) |
| **DiagnosticsPage.tsx** | "Diagnostics", "Statut systeme", "Details systeme", "Latence API", "Aucun log recent", "Erreurs recentes", "Authentification" (dev-only, basse priorite) |
| **TermsPage.tsx** | Entierement en francais (~500 mots, pas de i18n) |
| **PrivacyPage.tsx** | Entierement en francais (~800 mots, pas de i18n) |
| **ChangelogPage.tsx** | Items du changelog hardcodes en francais uniquement |
| **AdminDashboardPage.tsx** | ~50 textes hardcodes (admin-only, basse priorite) |

### TECH-02 : EventsPage textes inline non-i18n (MOYENNE)

Dans `EventsPage.tsx`, ~10 textes utilisent `locale === 'fr' ? '...' : '...'` au lieu du systeme `t()` :
- Ligne 284 : `locale === 'fr' ? 'Filtrer par categorie' : 'Filter by category'`
- Ligne 293 : `locale === 'fr' ? 'Tous' : 'All'`
- Ligne 371 : `locale === 'fr' ? 'Categorie' : 'Category'`
- Ligne 443 : `locale === 'fr' ? 'Aucun evenement...' : 'No upcoming events'`
- Lignes 113-125 : toasts avec ternaires locaux

### TECH-03 : Tutoiement vs Vouvoiement inconsistant (QUALITE)

La memoire du projet specifie : "L'application utilise exclusivement le vouvoiement". Pourtant :
- **FeedbackPage** : "Comment trouves-tu EASY ?", "Ton avis", "Dis-nous"
- **ReportPage** : "Choisis un type", "Decris le probleme s'il te plait"
- **InstallPage** : "Clique sur Tester" (DiagnosticsPage)
- **ChangelogPage** : "Tes stats t'attendent" (StatisticsPage dans changelog items)

### TECH-04 : OnboardingPage fallback Apple hardcode (BASSE)

Ligne 65-69 : `t('auth.appleError') || 'Erreur de connexion Apple'` - le fallback est en francais.

### TECH-05 : Trois systemes de toast concurrents (TECHNIQUE)

L'application importe simultanement :
- `react-hot-toast` (utilise dans la majorite des pages)
- `sonner` (utilise dans AdminDashboardPage)
- `@radix-ui/react-toast` (composant Toaster importe dans App.tsx)

Les 3 Toasters sont montes en parallele dans `App.tsx` (lignes 262-274). Cela peut creer des conflits de z-index et des doubles notifications.

---

## PHASE 2 : Audit UX (UX Designer Senior)

### UX-03 : Absence de lien vers les Favoris depuis la page Events

La page `/events/favorites` existe mais n'est accessible depuis aucun element de navigation visible sur `EventsPage.tsx`. Un utilisateur ne peut pas decouvrir cette fonctionnalite.

**Correction** : Ajouter un bouton/lien "Mes favoris" dans le header ou les filtres de la page Events.

### UX-04 : Changelog non traduit = experience cassee en anglais

Un utilisateur en mode anglais voit tous les items du changelog en francais. Les labels "Nouveautes/Ameliorations/Corrections/Securite" basculent mais pas les items eux-memes.

**Correction** : Ajouter les traductions anglaises des items du changelog, ou au minimum un message indiquant que le changelog est en francais uniquement.

### UX-05 : Pages legales non traduisibles

`TermsPage.tsx` et `PrivacyPage.tsx` sont entierement en francais sans i18n. Un utilisateur anglophone n'a pas acces aux conditions dans sa langue.

### UX-06 : Formulaire de feedback tutoie l'utilisateur

L'ensemble de la page Feedback utilise le tutoiement ("Comment trouves-tu EASY ?", "Ton avis"), en contradiction avec le standard de vouvoiement de l'application.

### UX-07 : Formulaire de rapport tutoie l'utilisateur

Idem pour ReportPage : "Choisis", "Decris le probleme s'il te plait", "Ton signalement".

### UX-08 : Page Installation non traduite

`InstallPage.tsx` contient ~40 textes en francais non-traduisibles, incluant les instructions specifiques iOS/Android/Desktop. Un utilisateur anglophone ne peut pas comprendre les etapes d'installation.

### UX-09 : Placeholders de formulaire en francais dans EventsPage

Les inputs `placeholder="Soiree de lancement..."` et `placeholder="Cafe Central, BU..."` restent en francais meme en mode anglais.

### UX-10 : Navigation incertaine depuis EventDetailPage

Le bouton retour navigue toujours vers `/events`, meme si l'utilisateur est arrive depuis les favoris ou un lien direct. Utiliser `navigate(-1)` serait plus naturel.

---

## PHASE 3 : Audit Beta-testeur (Utilisateur Final)

### BETA-01 : "J'ai change la langue en anglais mais certaines pages restent en francais"

Les pages Feedback, Report, Install, Changelog, Terms, Privacy sont integralement en francais, cassant l'experience multilingue.

### BETA-02 : "L'app me tutoie puis me vouvoie -- c'est bizarre"

La page d'installation, les parametres et les pages legales utilisent le vouvoiement, mais Feedback et Report utilisent le tutoiement. L'experience est incoherente.

### BETA-03 : "Comment je retrouve mes evenements favoris ?"

Pas de lien visible vers la page des favoris depuis la page Events.

### BETA-04 : "Le changelog est en francais meme si j'ai choisi anglais"

Les titres des sections changent mais pas les items.

### BETA-05 : "J'ai 3 notifications en meme temps pour la meme action"

Les 3 systemes de toast peuvent declencher des notifications superflues.

---

## Plan de Corrections

### Etape 1 : i18n -- FeedbackPage + ReportPage (priorite haute)

Ajouter ~50 cles dans translations.ts (blocs `feedback.*` et `report.*`). Corriger le tutoiement vers le vouvoiement. Refactoriser les 2 pages pour utiliser `t()`.

### Etape 2 : i18n -- InstallPage (priorite haute)

Ajouter ~45 cles dans translations.ts (bloc `install.*`). Refactoriser la page pour utiliser `t()`. Passer au vouvoiement.

### Etape 3 : i18n -- EventsPage inline ternaries

Remplacer les ~10 ternaires `locale === 'fr' ?` par des appels `t()` avec les cles correspondantes dans `events.*`.

### Etape 4 : i18n -- TermsPage + PrivacyPage

Ajouter les blocs `terms.*` et `privacy.*` (FR + EN) dans translations.ts. Refactoriser les 2 pages.

### Etape 5 : i18n -- ChangelogPage items

Ajouter un champ `itemsEn` aux entries du changelog pour afficher les items dans la langue de l'utilisateur.

### Etape 6 : UX -- Lien Favoris depuis EventsPage

Ajouter un bouton "Mes favoris" (icone coeur) a cote du bouton Filtres dans le header de la page Events.

### Etape 7 : Nettoyage -- Unifier les toasts

Supprimer les imports `sonner` dans AdminDashboardPage et le `Toaster`/`Sonner` de App.tsx, ne garder que `react-hot-toast` partout.

### Etape 8 : Correction tutoiement residuel

Passer au vouvoiement dans FeedbackPage, ReportPage, InstallPage et DiagnosticsPage.

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/lib/i18n/translations.ts` | +250 cles (feedback, report, install, terms, privacy, changelog, events extras) |
| `src/pages/FeedbackPage.tsx` | i18n complet + vouvoiement |
| `src/pages/ReportPage.tsx` | i18n complet + vouvoiement |
| `src/pages/InstallPage.tsx` | i18n complet + vouvoiement |
| `src/pages/EventsPage.tsx` | Remplacement ternaires par t() + lien favoris |
| `src/pages/TermsPage.tsx` | i18n complet |
| `src/pages/PrivacyPage.tsx` | i18n complet |
| `src/pages/ChangelogPage.tsx` | Items bilingues |
| `src/pages/DiagnosticsPage.tsx` | i18n basique + vouvoiement |
| `src/pages/AdminDashboardPage.tsx` | Remplacement toast sonner par react-hot-toast |
| `src/App.tsx` | Suppression Toaster et Sonner redondants |
| `src/pages/OnboardingPage.tsx` | Suppression fallback Apple hardcode |

---

## Estimation

- i18n (8 pages + 250 cles) : volume principal
- UX (lien favoris + nettoyage toasts) : 2 fichiers
- Qualite (vouvoiement) : inclus dans les refactorisations i18n
- Total : ~12 fichiers modifies, ~800 lignes ajoutees/modifiees
