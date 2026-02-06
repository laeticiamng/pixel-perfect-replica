

# Audit Triple - EASY v1.7.x (Iteration 6)
## Phase 1 : Technique | Phase 2 : UX | Phase 3 : Beta-testeur

---

## PHASE 1 : Audit Technique (Dev Senior)

### TECH-06 : DeleteAccountDialog 100% hardcode en francais (CRITIQUE)

**Fichier** : `src/components/DeleteAccountDialog.tsx`

Tous les textes sont en francais sans i18n :
- Ligne 50 : `'Ton compte a été supprimé'`
- Ligne 54 : `'Erreur lors de la suppression. Contacte le support.'`
- Ligne 69 : `'Supprimer mon compte'`
- Ligne 79 : `'Supprimer ton compte ?'`
- Ligne 82-84 : Toute la description du dialogue
- Ligne 90 : `'Tape SUPPRIMER pour confirmer'`
- Ligne 109 : `'Supprimer définitivement'`
- Ligne 113 : `'Annuler'`

De plus, le texte de confirmation "SUPPRIMER" est hardcode. Un utilisateur anglophone ne sait pas quoi taper. Il faut utiliser "DELETE" en anglais et "SUPPRIMER" en francais.

De plus, le composant utilise le **tutoiement** : "Ton compte", "Supprimer ton compte" (devrait etre vouvoiement).

### TECH-07 : EmergencyContactsManager 100% hardcode en francais (MOYENNE)

**Fichier** : `src/components/safety/EmergencyContactsManager.tsx`

~15 textes hardcodes :
- `'Remplis tous les champs'`, `'Maximum 3 contacts d'urgence'`, `'Numéro de téléphone invalide'`
- `'Erreur lors de l'ajout'`, `'Contact ajouté !'`, `'Erreur lors de la suppression'`
- `'Contact supprimé'`, `'Contacts d'urgence'`, `'Ces contacts seront alertés en cas d'urgence'`
- `'Nom du contact'`, `'Numéro de téléphone'`, `'Annuler'`, `'Ajouter'`
- `'Ajouter un contact d'urgence'`, `'En cas d'urgence, maintiens le bouton...'`

### TECH-08 : MiniChat 100% hardcode en francais (MOYENNE)

**Fichier** : `src/components/social/MiniChat.tsx`

- Ligne 69 : `'Chat avec {name}'`
- Ligne 79 : `'{remaining}/{max} restants'`
- Ligne 88-89 : `'Envoie un message...'`, `'messages max'`
- Ligne 115-118 : `formatDistanceToNow` avec `locale: fr` hardcode
- Ligne 136 : `placeholder="Écris ton message..."`
- Ligne 144 : `aria-label="Envoyer le message"`
- Ligne 156 : `'Limite de messages atteinte'`
- Ligne 159 : `'Continuez la conversation en personne !'`

### TECH-09 : PublicProfilePreview 100% hardcode en francais (MOYENNE)

**Fichier** : `src/components/profile/PublicProfilePreview.tsx`

- Ligne 16-22 : `activityLabels` hardcodes en francais (`'Réviser'`, `'Manger'`, `'Bosser'`...)
- Ligne 72 : `'Prévisualiser le profil public'`
- Ligne 79 : `'Aperçu du profil public'`
- Ligne 85 : `'Voici ce que les autres utilisateurs voient de ton profil'`
- Ligne 100 : `'Utilisateur'`
- Ligne 111 : `'Étudiant vérifié'`
- Ligne 130-145 : `'Note'`, `'Rencontres'`, `'Actif'`
- Ligne 152 : `'Activités favorites'`
- Ligne 164 : `'Les autres ne voient jamais ton email...'`

### TECH-10 : SmartLocationRecommender hardcode en francais (BASSE)

**Fichier** : `src/components/social/SmartLocationRecommender.tsx`

- Ligne 61 : `'Suggestions IA de lieux pour...'`
- Ligne 69 : `'Recommandations IA - {city}'`
- Ligne 84 : `'Actualiser les recommandations'`
- Ligne 94 : `'Analyse en cours...'`
- Ligne 105 : `'Réessayer'`
- Ligne 163 : `'Sources :'`
- Ligne 190 : `'Masquer'`

### TECH-11 : EmptyRadarState textes de partage hardcodes (BASSE)

**Fichier** : `src/components/map/EmptyRadarState.tsx` (lignes 19-20)

Les textes `navigator.share` sont hardcodes en francais :
- `title: 'EASY - Le premier réseau social 100% réel'`
- `text: 'Rejoins-moi sur EASY pour des rencontres spontanées en vrai !'`

Le lettre "T" dans le radar (ligne 79) est hardcode au lieu d'utiliser l'initiale de l'utilisateur.

### TECH-12 : AdminDashboardPage entierement hardcode (BASSE, admin-only)

**Fichier** : `src/pages/AdminDashboardPage.tsx`

~50 textes hardcodes en francais. Priorite basse car page admin uniquement.

---

## PHASE 2 : Audit UX (UX Designer Senior)

### UX-11 : Dialogue de suppression de compte inaccessible aux anglophones

Un utilisateur anglophone doit taper "SUPPRIMER" pour supprimer son compte -- un mot francais qu'il ne connait pas. Le dialogue entier est en francais. C'est un blocage fonctionnel pour tout utilisateur non-francophone.

### UX-12 : Mini-chat non traduit casse l'experience de conversation

Apres avoir rencontre quelqu'un via le radar, le mini-chat affiche des textes en francais (`'Écris ton message...'`, `'restants'`). Les timestamps (`formatDistanceToNow`) sont exclusivement en francais.

### UX-13 : Preview de profil public non traduit

La preview montrant "ce que les autres voient" de votre profil est integralement en francais, avec des labels d'activites hardcodes (`'Réviser'`, `'Bosser'`). Cela ne reflete pas l'experience reelle si l'utilisateur est en mode anglais.

### UX-14 : Contacts d'urgence non traduits

La fonctionnalite de securite critique (contacts d'urgence) est entierement en francais. Un utilisateur anglophone ne peut pas comprendre comment ajouter un contact d'urgence.

### UX-15 : Partage du radar envoie un texte francais

Quand un utilisateur anglophone clique "Invite friends" sur le radar vide, le texte partage est en francais : "Rejoins-moi sur EASY pour des rencontres spontanées en vrai !"

---

## PHASE 3 : Audit Beta-testeur (Utilisateur Final)

### BETA-06 : "J'ai voulu supprimer mon compte mais je ne comprends pas ce qu'il faut taper"

Un utilisateur anglophone voit le dialogue de suppression entierement en francais avec "Tape SUPPRIMER pour confirmer". Il ne sait pas quoi ecrire.

### BETA-07 : "Apres avoir rencontre quelqu'un, le chat est en francais meme si j'ai choisi anglais"

Le mini-chat affiche des timestamps, placeholders et messages systeme en francais.

### BETA-08 : "Mon profil public montre des activites en francais alors que je suis en anglais"

Les badges d'activite dans la preview ("Réviser", "Bosser") restent en francais.

### BETA-09 : "Je ne comprends pas comment ajouter un contact d'urgence -- tout est en francais"

Les instructions et formulaires des contacts d'urgence sont integralement en francais.

---

## Plan de Corrections

### Etape 1 : i18n -- DeleteAccountDialog (priorite haute)

Ajouter ~15 cles dans `translations.ts` (bloc `deleteAccount.*`). Refactoriser le composant pour utiliser `t()`. Le mot de confirmation doit etre dynamique : `DELETE` en EN, `SUPPRIMER` en FR. Passer au vouvoiement.

### Etape 2 : i18n -- EmergencyContactsManager (priorite haute)

Ajouter ~15 cles dans `translations.ts` (bloc `emergency.*`). Refactoriser le composant pour utiliser `t()`.

### Etape 3 : i18n -- MiniChat (priorite haute)

Ajouter ~10 cles dans `translations.ts` (bloc `miniChat.*`). Refactoriser le composant avec locale dynamique pour `date-fns`.

### Etape 4 : i18n -- PublicProfilePreview (priorite moyenne)

Ajouter ~10 cles dans `translations.ts` (bloc `publicProfile.*`). Remplacer `activityLabels` hardcodes par les cles de traduction existantes `activities.*`. Passer au vouvoiement.

### Etape 5 : i18n -- SmartLocationRecommender (priorite basse)

Ajouter ~8 cles dans `translations.ts` (bloc `locationRecommender.*`).

### Etape 6 : EmptyRadarState -- Texte de partage i18n

Remplacer les textes `navigator.share` par des appels `t()`.

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/lib/i18n/translations.ts` | +60 cles (deleteAccount, emergency, miniChat, publicProfile, locationRecommender, share) |
| `src/components/DeleteAccountDialog.tsx` | i18n complet + vouvoiement + confirmation mot dynamique |
| `src/components/safety/EmergencyContactsManager.tsx` | i18n complet |
| `src/components/social/MiniChat.tsx` | i18n complet + locale dynamique date-fns |
| `src/components/profile/PublicProfilePreview.tsx` | i18n complet + vouvoiement + utiliser `t('activities.*')` |
| `src/components/social/SmartLocationRecommender.tsx` | i18n complet |
| `src/components/map/EmptyRadarState.tsx` | i18n texte de partage |

---

## Estimation

- i18n composants critiques (DeleteAccountDialog, EmergencyContacts, MiniChat) : 3 fichiers prioritaires
- i18n composants secondaires (PublicProfilePreview, SmartLocationRecommender, EmptyRadarState) : 3 fichiers
- Total : ~60 nouvelles cles, ~7 fichiers modifies, ~300 lignes ajoutees/modifiees

