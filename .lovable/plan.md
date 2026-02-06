

# Audit Technique Senior Dev - EASY v1.7.x (Iteration 4)

## Resume

Apres analyse exhaustive des fichiers restants non couverts par les 3 audits precedents, voici les problemes identifies sur les pages et composants encore non corriges.

---

## Problemes de Securite

### SEC-04 : EventDetailPage check-in contourne la RPC (CRITIQUE)

**Fichier** : `src/pages/EventDetailPage.tsx` (lignes 123-134)

La fonction `handleScanCheckIn` fait un `UPDATE` direct sur `event_participants` sans valider le QR secret cote serveur. Le secret scanne est completement ignore -- n'importe quel participant peut marquer son check-in sans QR code valide.

```
const { error } = await supabase
  .from('event_participants')
  .update({ checked_in: true, checked_in_at: new Date().toISOString() })
  .eq('event_id', eventId)
  .eq('user_id', user.id);
```

La RPC `check_in_event_by_qr` existe deja mais n'est pas utilisee ici.

**Correction** : Utiliser `checkInToEvent(eventId, scannedSecret)` du hook `useEvents` qui appelle la RPC securisee.

### SEC-05 : EventCheckinPage meme probleme (CRITIQUE)

**Fichier** : `src/pages/EventCheckinPage.tsx` (lignes 61-68)

Meme pattern : `UPDATE` direct sur `event_participants` sans validation du secret. Le commentaire en ligne 58 dit "The backend RLS will validate this" mais la RLS `event_participants` UPDATE ne verifie que `organizer_id`, pas le secret QR.

**Correction** : Remplacer par `checkInToEvent(eventId, extractedSecret)`.

### SEC-06 : FavoriteEventsPage accede directement a la table events (MOYEN)

**Fichier** : `src/pages/FavoriteEventsPage.tsx` (lignes 44-48)

La requete `supabase.from('events').select(...)` echouera silencieusement car la RLS de `events` ne permet le SELECT que pour `organizer_id = auth.uid()`. Les favoris d'evenements d'autres organisateurs seront vides.

**Correction** : Utiliser la RPC `get_events_public` puis filtrer par IDs favoris, ou creer une RPC `get_events_by_ids`.

---

## Problemes d'Internationalisation (i18n)

### I18N-02 : 7 composants et pages non internationalises (HAUTE)

| Composant/Page | Textes hardcodes |
|----------------|-----------------|
| `EventDetailPage.tsx` | "En cours", "Organisateur", "Inscrit", "Rejoindre", "Partager", "Participants", "Aucun participant", "Sois le premier", "Presente", "Check-in QR Code", "Scanne pour confirmer", "Copier le lien", "Evenement non trouve", "Retour aux evenements", date `format(..., { locale: fr })` |
| `EventCheckinPage.tsx` | "Connecte-toi pour faire le check-in", "Se connecter", "Verification...", "Check-in reussi", "Erreur", "Scanner le QR Code", "Reessayer", "Retour a l'evenement", "Ta presence est confirmee" |
| `SessionCheckin.tsx` | "Session terminee", "Merci d'avoir participe", "Check-in effectue", "Terminer la session", "En cours...", "Pointage", "Confirme ta presence", "Fenetre de check-in ouverte", "Trop loin", "Check-in non disponible", "Reviens plus proche" |
| `SessionFeedbackForm.tsx` | "Comment s'est passee la session ?", "Participant X sur Y", "Evalue cette personne", "Etait a l'heure", "Agreable a cotoyer", "Je recommande", "Commentaire (optionnel)", "Precedent", "Suivant", "Terminer" |
| `CreateSessionForm.tsx` | "Activite", "Date", "Choisir", "Heure", "Duree", "45 minutes", "1h30", "3 heures", "Ville", "Lieu precis", "Note", "Annuler", "Creation...", "Creer le creneau", tous les placeholders et messages de validation |
| `TestimonialForm.tsx` | "Partage ton experience !", "Ton temoignage aidera", "Raconte comment", "Minimum 20 caracteres", "Ecris un temoignage", "Plus tard", "Envoyer", "Envoi...", "Merci pour ton temoignage" |
| `SessionCard.tsx` | "Reviser", "Bosser", "Manger", "Sport", "Parler", "Autre", "fiabilite", "participants", "Complet", "Quitter", "Rejoindre", "Annuler", "Annule", "Session exportee" |
| `SessionHistoryPage.tsx` | "Historique des sessions", "Toutes", "Creees", "Rejointes", "Total", "Completees", "Aucune session passee", "Ton historique apparaitra ici", "Createur", "Completee", "Annulee", "Non completee", "Exporter (.ics)", "Erreur lors du chargement" |
| `FavoriteEventsPage.tsx` | "Mes Favoris", "evenements sauvegardes", "Aucun favori", "Passe", "A venir", "Decouvrir les evenements" |
| `DiagnosticsPage.tsx` | "Diagnostics", "Statut systeme", "Reseau", "Details systeme", "Latence API", "Tester", "Logs recents", "Aucun log", "Erreurs recentes" (dev only, basse priorite) |

### I18N-03 : Toasts hardcodes dans useBinomeSessions (MOYENNE)

**Fichier** : `src/hooks/useBinomeSessions.ts`

8 toasts en francais : "Vous devez etre connecte", "Creneau cree avec succes", "Vous avez rejoint la session", "Vous avez quitte la session", "Session annulee", "Erreur lors de l'annulation".

---

## Problemes de Performance / Robustesse

### PERF-04 : SessionDetailPage utilise `.single()` pour feedback/testimonials (BASSE)

**Fichier** : `src/pages/SessionDetailPage.tsx` (lignes 121-123)

`.single()` lance une erreur si aucun enregistrement n'est trouve. Il faut utiliser `.maybeSingle()` pour eviter les erreurs en console.

### PERF-05 : SessionHistoryPage requetes en cascade (MOYENNE)

Le composant fait 3 requetes sequentielles (created sessions, participations, joined sessions). Pourrait etre optimise avec `Promise.all`.

---

## Plan de Corrections

### Etape 1 : Securite - Check-in events (CRITIQUE)

**EventDetailPage.tsx** : Remplacer `handleScanCheckIn` pour utiliser `checkInToEvent` du hook `useEvents`.

**EventCheckinPage.tsx** : Remplacer `handleCheckin` pour utiliser `checkInToEvent`.

### Etape 2 : Securite - FavoriteEventsPage RLS

Remplacer le `SELECT` direct sur `events` par la RPC `get_events_public` filtree par IDs.

### Etape 3 : i18n - Ajout de ~200 cles de traduction

Ajouter les blocs suivants dans `translations.ts` :
- `eventDetail.*` (~30 cles)
- `eventCheckin.*` (~15 cles)
- `sessionCheckin.*` (~15 cles)
- `sessionFeedback.*` (~15 cles)
- `createSession.*` (~20 cles)
- `testimonial.*` (~10 cles)
- `sessionCard.*` (~15 cles)
- `sessionHistory.*` (~20 cles)
- `favoriteEvents.*` (~10 cles)
- `diagnostics.*` (~15 cles, basse priorite)

### Etape 4 : i18n - Toasts useBinomeSessions

Transformer les toasts pour accepter un parametre `t` ou utiliser `useTranslation()` dans le hook.

### Etape 5 : Refactoriser les 10 composants/pages

Pour chaque fichier :
1. Importer `useTranslation`
2. Remplacer chaque texte hardcode par `t('cle')`
3. Remplacer `{ locale: fr }` par locale dynamique `locale === 'fr' ? fr : enUS`
4. Remplacer `.single()` par `.maybeSingle()` pour les lookups optionnels

### Etape 6 : Optimisation SessionHistoryPage

Paralleliser les requetes avec `Promise.all`.

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/pages/EventDetailPage.tsx` | Securite check-in + i18n complet + dates localisees |
| `src/pages/EventCheckinPage.tsx` | Securite check-in + i18n complet |
| `src/pages/FavoriteEventsPage.tsx` | RLS fix + i18n complet + dates localisees |
| `src/pages/SessionHistoryPage.tsx` | i18n + dates localisees + `Promise.all` |
| `src/components/binome/SessionCheckin.tsx` | i18n complet |
| `src/components/binome/SessionFeedbackForm.tsx` | i18n complet |
| `src/components/binome/CreateSessionForm.tsx` | i18n complet + dates localisees |
| `src/components/binome/TestimonialForm.tsx` | i18n complet |
| `src/components/binome/SessionCard.tsx` | i18n complet + dates localisees |
| `src/hooks/useBinomeSessions.ts` | i18n toasts |
| `src/pages/SessionDetailPage.tsx` | `.single()` -> `.maybeSingle()` |
| `src/lib/i18n/translations.ts` | +200 nouvelles cles |

---

## Estimation

- Securite (check-in + RLS) : 3 fichiers critiques
- i18n : ~200 nouvelles cles + 10 refactorisations
- Performance : 2 fichiers
- Total : ~12 fichiers modifies, ~600 lignes ajoutees/modifiees

