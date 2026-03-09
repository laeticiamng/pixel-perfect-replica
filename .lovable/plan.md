

# Audit NEARVITY -- Ce qui manque pour être unique et révolutionnaire

## Etat actuel : ce qui a été implémenté

Les éléments suivants sont opérationnels :
- Système de signaux (green/yellow/red) avec géolocalisation temps réel
- Sessions binôme avec quota, Stripe, feedback, fiabilité
- Événements avec QR check-in, favoris, catégories
- Messagerie complète (conversations, unread badges, Realtime)
- Page Connexions/Amis avec chat intégré
- Centre de notifications avec badges temps réel
- Gamification (streaks, achievements, leaderboard campus)
- Événements sur la carte avec indicateur "Happening Now"
- i18n (EN/FR/DE), dark/light, PWA, RLS, rate limiting, shadow banning
- Referral, admin dashboard, reliability scoring, command palette

---

## Lacunes critiques restantes

### 1. Pas de découverte d'utilisateurs hors proximité
Les utilisateurs ne peuvent trouver d'autres personnes que via le radar live. Aucun annuaire, aucune recherche par activité/université/intérêts. La plateforme est vide quand personne n'a son signal activé.

**Manquant :** Page de découverte / feed, section "gens près de ton campus", matching par activité favorite.

### 2. Pas de formation de groupe / meetup spontané
La plateforme connecte uniquement en 1-to-1. Si 4 personnes étudient à proximité, impossible de "former un groupe".

**Manquant :** Signal de groupe ("je cherche 3+ personnes"), chat de groupe, carte d'activité de groupe.

### 3. Pas de suggestions intelligentes de timing
L'IA fait des recommandations basiques. Aucune analyse "Ton campus est le plus actif le mardi à midi" ni "3 personnes étudient ici habituellement à 14h".

**Manquant :** Heatmap campus par horaire, suggestion "meilleur moment pour activer", patterns d'activité historiques.

### 4. Pas de hub campus / communauté
La plateforme est générique -- pas de contenu spécifique par campus, pas de tableau d'affichage, pas de feed communautaire.

**Manquant :** Page campus, feed communautaire, événements campus, outils admin université.

---

## Lacunes UX

### 5. Pas de tutoriel onboarding pour les fonctionnalités clés
`PostSignupOnboardingPage` existe mais les fonctionnalités de la carte (activation signal, radar vs map, icebreakers) n'ont aucun guide. Un nouvel utilisateur voit une carte vide sans aide.

**Manquant :** Walkthrough interactif (tooltips/coach marks) à la première visite de la carte.

### 6. Pas de feedback haptique/audio pour les actions clés
Activation du signal, réception d'une demande de connexion, détection d'un utilisateur proche -- rien de tout cela ne déclenche de vibration (malgré le setting `proximity_vibration`) ni de son.

**Manquant :** Intégration API Vibration, signaux audio pour les alertes de proximité.

### 7. Les empty states manquent d'engagement
`EmptyRadarState` a un radar animé et un CTA d'invitation, ce qui est bien. Mais il manque du social proof, des suggestions d'activités, ou de la gamification "sois le premier".

**Manquant :** Stats communautaires dans l'empty state, suggestion de sessions binôme programmées, countdown "prochaine activité à X".

### 8. Pas de badges de vérification visibles sur la carte
Les badges de vérification (étudiant vérifié) existent en DB mais ne sont affichés ni sur les marqueurs de carte ni dans `UserPopupCard`.

**Manquant :** Icônes de badge sur les marqueurs, indicateurs de confiance dans UserPopupCard.

---

## Différenciateurs manquants

### 9. Pas de notes vocales / intégration audio
`VoiceIcebreakerButton` génère des icebreakers audio. Mais pas de fonctionnalité de note vocale dans le chat, pas de message audio rapide.

**Manquant :** Notes vocales dans le chat, playback d'icebreaker audio, feature walkie-talkie de proximité.

### 10. Pas de mode offline robuste
La PWA est configurée mais pas de cache de données offline, pas de service worker pour background sync, pas d'indicateur offline au-delà de `OfflineBanner`.

**Manquant :** Architecture offline-first avec sessions en cache, actions en queue, sync en background.

---

## Dette technique

### 11. `(supabase as any)` dans useConnections
Le hook `useConnections` utilise `(supabase as any)` partout (lignes 33, 50, 85, 113, 139). La table `connections` n'est probablement pas dans les types générés. Cela casse la type-safety et masque les erreurs.

### 12. Mock data toujours utilisée dans signalStore
`src/stores/signalStore.ts` utilise `generateMockUsers` (ligne 55) pour les utilisateurs proches. Le vrai hook `useActiveSignal` existe et fonctionne, mais le store référence encore les mocks. Ce store semble d'ailleurs inutilisé vu que `useMapPageLogic` utilise directement `useActiveSignal`.

### 13. Pas de couverture E2E pour les flux critiques
Les fichiers de test existent mais sont principalement unitaires. Pas de vrai test E2E pour : signup → activer signal → voir utilisateur proche → envoyer icebreaker → chat.

---

## Ordre de priorité d'implémentation

```text
Priorité 1 (Différenciation) :
  [1] Découverte d'utilisateurs hors proximité
  [2] Formation de groupe / meetup spontané
  [5] Tutoriel onboarding interactif

Priorité 2 (Engagement) :
  [3] Suggestions intelligentes de timing
  [7] Empty states enrichis (social proof, suggestions)
  [8] Badges de vérification sur la carte

Priorité 3 (Innovation) :
  [9] Notes vocales dans le chat
  [4] Hub campus / communauté
  [6] Feedback haptique/audio

Priorité 4 (Qualité) :
  [11] Supprimer les `as any` dans useConnections
  [12] Supprimer le signalStore mock inutilisé
  [10] Robustesse offline
  [13] Tests E2E
```

