# NEARVITY — Audit de complétude & plan d'exécution (Lovable)

## Méthode
- Audit module par module (10/10) basé sur l'état réel du code front + hooks + routes Supabase.
- Priorisation mobile-first et contraintes Lovable.dev (itérations rapides, UI testable preview, compat PWA).

## Statut actuel (codebase)
1. **Radar Temps Réel** — **Partiel avancé**
   - Carte + radar sonar disponibles, realtime actif sur `active_signals`.
   - Reste: perf <2s garantie, optimisations batterie, qualité de clustering.
2. **3 États de Signal** — **Implémenté**
   - Cycle 1-tap (open/conditional/busy) et persistance Supabase.
3. **Sessions Binôme** — **Partiel**
   - Création/rejoindre/quitter + historique OK.
   - Reste: fluidité UX, fallback sans ville, robustesse erreurs RPC.
4. **Ghost Mode** — **Partiel**
   - Existence fonctionnelle côté requêtes, mais UX et garanties exhaustives à renforcer.
5. **Export GDPR** — **Partiel avancé**
   - Export présent, à compléter sur formats et couverture exhaustive.
6. **Carte Interactive** — **Implémenté (v1)**
   - Carte opérationnelle + filtres activité/signal.
7. **Réservation** — **Partiel**
   - Couvert en pratique par Binôme (créneaux), manque packaging produit dédié.
8. **Événements** — **Implémenté (v1)**
   - Pages events/checkin/favorites présentes.
9. **Profil & Statistiques** — **Implémenté (v1)**
   - Profil + stats + historique disponibles.
10. **Messagerie** — **Partiel**
   - Hook + mini-chat existants, module page dédiée à consolider.

## Plan d'exécution complet (Lovable)

### Sprint A — Stabilisation coeur (1-2 semaines)
- Binôme: chargement par défaut sans ville, messages d'erreur explicites, rafraîchissement fiable.
- Messagerie: page dédiée `/messages`, parcours direct depuis interactions, état vide clair.
- QA smoke mobile: auth -> map -> signal -> reveal -> binôme -> messages.

### Sprint B — Fiabilité realtime (1-2 semaines)
- Réduire latence perçue (<2s) avec throttling client + batching refresh.
- Fiabiliser présence/absence (reconnect, offline/online).
- Instrumentation analytics (temps de refresh, erreurs RPC, abandon flow).

### Sprint C — Privacy/PWA (1 semaine)
- Ghost mode: vérification systématique sur toutes les requêtes géo.
- PWA: offline strategy par page critique + test install + manifest/icônes.
- RGPD: vérification couverture export (messages, sessions, interactions, settings).

### Sprint D — Productisation (1 semaine)
- Positionner clairement Réservation = Binôme dans le wording FR/EN.
- Polissage UI extérieur (contraste fort, touch targets, soleil extérieur).
- Final QA E2E + checklist release Lovable preview -> prod.

## Définition de "complet"
- 10 modules accessibles en navigation sans écran vide bloquant.
- Tous parcours critiques testés mobile (iOS Safari + Android Chrome).
- Supabase RLS/RPC validés par scénario utilisateur réel.
- Build PWA stable, installable, et route protected sans boucle.
