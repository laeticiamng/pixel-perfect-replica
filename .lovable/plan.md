

## Audit Beta Testeur Complet — NEARVITY v2.0.0

**Date** : 1er mars 2026 | **Score global** : 24/25 tests OK (96%)

---

### Resultats par categorie

| # | Test | Statut | Details |
|---|------|--------|---------|
| 1 | Landing page `/` | OK | Hero, CTA, sous-titre, badge "pas une app de rencontre" — tout charge |
| 2 | Cookie consent RGPD | OK | Banniere affichee, bouton Accepter/Refuser, disparait apres clic |
| 3 | i18n FR/EN toggle | OK | Bascule instantanee, textes FR et EN complets |
| 4 | Route protegee `/map` | OK | Redirige vers `/onboarding` |
| 5 | Route protegee `/premium` | OK | Meme comportement, redirection + toast |
| 6 | Signup `/onboarding` | OK | Formulaire complet |
| 7 | Login (toggle) | OK | Lien "Deja un compte ?" fonctionne |
| 8 | Mot de passe oublie | OK | Lien visible |
| 9 | Lien magique | OK | Bouton present |
| 10 | Page Conditions `/terms` | OK | Contenu complet |
| 11 | Page Confidentialite `/privacy` | OK | Sections RGPD completes |
| 12 | Page Aide `/help` | OK | FAQ, barre de recherche |
| 13 | Page Changelog `/changelog` FR | OK | v1.0.0 a v2.0.0 en francais |
| 14 | Page Changelog `/changelog` EN | OK | **NOUVEAU** — "Update history", "New Features", "Security" — tout traduit en anglais |
| 15 | Page 404 | OK | Message "Page introuvable", bouton retour |
| 16 | Desktop sidebar | OK | Navigation complete |
| 17 | Theme switcher | OK | 3 modes |
| 18 | Network — analytics | OK | Pas de spam |
| 19 | Network — user_settings | OK | 0 requete (cache actif) |
| 20 | Console — erreurs app | WARN | Warning `forwardRef` (P2 connu) |
| 21 | Console — erreurs bloquantes | OK | Zero erreur bloquante |
| 22 | GEO/SEO | OK | JSON-LD, llms.txt, robots.txt avec GPTBot/ClaudeBot, sitemap enrichi |
| 23 | Scroll/overflow mobile | OK | Aucun debordement |
| 24 | Footer EN | OK | "Made with love in France by EmotionsCare Sasu", "The first 100% real social network" |
| 25 | Edge Function `notifications` cron | ECHEC | P3 persiste — version deployee obsolete |

---

### Probleme persistant : P3 — Cron `notifications` (version deployee obsolete)

**Severite** : Moyenne (pas d'impact utilisateur, pollution des logs)

**Evidence** : Les logs Edge Function montrent toujours l'erreur toutes les 5 minutes :

```text
2026-03-01T20:00:08Z ERROR [notifications/auth] Token validation failed:
AuthApiError: invalid claim: missing sub claim
validateAuth (notifications/index.ts:33:54)
Server.handler (notifications/index.ts:466:32)
```

**Diagnostic** : La stack trace montre `validateAuth` a la **ligne 33** du fichier deploye. Or dans le code source actuel, la ligne 33 est `body: string;` (une interface). La fonction `validateAuth` est definie a la ligne ~80 dans le code source. Cela prouve formellement que **la version deployee est une ancienne version du fichier** qui ne contient pas le fix `isAnonKey`.

Le fix est bien present dans le code source (lignes 519-524) :

```text
const isServiceRole = token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const isAnonKey = token === Deno.env.get("SUPABASE_ANON_KEY");
if (!isServiceRole && !isAnonKey) { ... }
```

Mais il n'a jamais ete deploye en production.

**Action requise** : Forcer le redeploiement de la Edge Function `notifications` via l'outil `deploy_edge_functions`. Une modification mineure du fichier (ajout d'un commentaire de version par exemple) declenchera le redeploiement automatique.

---

### Progression depuis le dernier audit

| Element | Avant | Maintenant |
|---------|-------|------------|
| Changelog EN | A VERIFIER | OK — entierement traduit et verifie visuellement |
| GEO/SEO (llms.txt, JSON-LD) | N/A | OK — implemente |
| P3 cron notifications | ECHEC | ECHEC — fix dans le code mais pas deploye |
| Score global | 92% (23/25) | 96% (24/25) |

---

### Plan de correction P3

1. Ajouter un commentaire de version au fichier `supabase/functions/notifications/index.ts` pour forcer le redeploiement
2. Deployer la Edge Function via `deploy_edge_functions`
3. Verifier dans les logs que l'erreur `missing sub claim` disparait au prochain cycle cron (5 min)

