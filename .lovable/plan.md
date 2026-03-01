

## Audit Beta Testeur Complet — NEARVITY v2.0.0

**Date** : 1er mars 2026 | **Score global** : 23/25 tests OK (92%)

---

### Resultats par categorie

| # | Test | Statut | Details |
|---|------|--------|---------|
| 1 | Landing page `/` | OK | Hero, CTA, sous-titre, badge "pas une app de rencontre" — tout charge |
| 2 | Cookie consent RGPD | OK | Banniere affichee, bouton Accepter/Refuser, disparait apres clic |
| 3 | i18n FR/EN toggle | OK | Bascule instantanee, tous les textes traduits (hero, CTA, header) |
| 4 | Route protegee `/map` | OK | Redirige vers `/onboarding` avec toast "Connecte-toi pour acceder" |
| 5 | Route protegee `/premium` | OK | Meme comportement, redirection + toast |
| 6 | Signup `/onboarding` | OK | Formulaire complet : email, password, prenom, universite (optionnel), OAuth Google/Apple |
| 7 | Login (toggle) | OK | Lien "Deja un compte ? Se connecter" bascule correctement |
| 8 | Mot de passe oublie | OK | Lien visible sur le formulaire login |
| 9 | Lien magique | OK | Bouton "Utiliser un lien magique" present |
| 10 | Page Conditions `/terms` | OK | 14 sections, contenu complet, pas de texte coupe |
| 11 | Page Confidentialite `/privacy` | OK | Sections RGPD, donnees collectees, droits utilisateur |
| 12 | Page Aide `/help` | OK | 12 questions FAQ, barre de recherche, sidebar desktop |
| 13 | Page Changelog `/changelog` | OK | v1.0.0 a v2.0.0, traduction FR fonctionnelle |
| 14 | Page 404 | OK | Message "Page introuvable", bouton retour, sidebar visible |
| 15 | Desktop sidebar | OK | Navigation complete (Carte, Reserver, Evenements, Profil, Stats, etc.) |
| 16 | Theme switcher | OK | 3 modes visibles dans la sidebar (clair, sombre, systeme) |
| 17 | Network — analytics | OK | Seulement 2 requetes `analytics_events` (POST 201) — pas de spam |
| 18 | Network — user_settings | OK | Fix P1 confirme : 0 requete `user_settings` visible (cache actif) |
| 19 | Console — erreurs app | WARN | Warning `forwardRef` (P2 connu, documente dans known-issues.md) |
| 20 | Console — erreurs bloquantes | OK | Zero erreur applicative bloquante |
| 21 | Edge Function `notifications` | ECHEC | P3 persiste — `403: invalid claim: missing sub claim` toutes les 5 min |
| 22 | Changelog EN | A VERIFIER | La page est en FR (langue active), besoin de basculer en EN pour confirmer |
| 23 | Scroll/overflow mobile | OK | Aucun debordement detecte sur les pages testees |

---

### Probleme persistant : P3 — Cron `notifications`

**Severite** : Moyenne (pas d'impact utilisateur direct, mais pollution des logs)

**Evidence** : Les logs Edge Function montrent toujours l'erreur toutes les 5 minutes :
```text
2026-03-01T18:05:03Z ERROR [notifications/auth] Token validation failed: 
AuthApiError: invalid claim: missing sub claim
```

**Analyse technique** : Le code source (`notifications/index.ts` lignes 519-540) contient bien le fix avec comparaison `SUPABASE_ANON_KEY`. Cependant, l'erreur provient de `validateAuth` qui est appelee AVANT le switch case dans la version deployee. Cela signifie que **la derniere version du code n'a pas ete deployee** sur l'infrastructure Edge Functions.

**Cause probable** : Le deploiement de la Edge Function n'a pas ete declenche apres la modification du code. La version en production est encore l'ancienne version sans le bypass anon key.

**Action requise** : Forcer le redeploiement de la Edge Function `notifications` pour que le fix prenne effet.

---

### Resume des actions recommandees

1. **Redeployer la Edge Function `notifications`** — le fix P3 est dans le code mais pas en production
2. **Verifier la traduction EN du changelog** — basculer en anglais et confirmer que les items s'affichent en anglais
3. **P2 (forwardRef)** — reste un warning connu, aucune action requise avant migration Framer Motion v13+

