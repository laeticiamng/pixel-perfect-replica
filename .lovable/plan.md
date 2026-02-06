
# Audit Technique Senior Dev - EASY v1.7.x (Iteration 3)

## Resume des problemes identifies

Apres analyse exhaustive de tous les hooks, pages et flux restants, voici les problemes non couverts par les audits precedents.

---

## Problemes de Securite

### SEC-01 : QR Check-in contourne les RLS (CRITIQUE)

**Fichier** : `src/hooks/useEvents.ts` (lignes 157-170)

La methode `checkInToEvent` lit `qr_code_secret` directement depuis la table `events` :
```
const { data: event } = await supabase
  .from('events')
  .select('qr_code_secret')
  .eq('id', eventId)
  .single();
```

Or les policies RLS de la table `events` ne permettent `SELECT` que pour l'organisateur (`auth.uid() = organizer_id`). Un participant non-organisateur ne peut PAS lire `qr_code_secret`, donc le check-in echouera SILENCIEUSEMENT.

**Correction** : Creer une fonction RPC `check_in_event_by_qr(p_event_id, p_qr_secret)` en SECURITY DEFINER qui valide le secret et met a jour le check-in cote serveur, sans jamais exposer le secret au client.

---

### SEC-02 : user_reliability upsert incorrect (MOYEN)

**Fichier** : `src/hooks/useBinomeSessions.ts` (lignes 182-189)

Lors de la creation d'une session, le code fait un upsert sur `user_reliability` avec `sessions_created: 1` et `onConflict: 'user_id'`. Probleme : le upsert REMPLACE le champ `sessions_created` par 1 au lieu de l'incrementer. Si l'utilisateur a deja cree 10 sessions, son compteur revient a 1.

**Correction** : Utiliser un appel RPC ou un `UPDATE ... SET sessions_created = sessions_created + 1` via une fonction SECURITY DEFINER. En fait, la table `user_reliability` bloque les UPDATE directs (`USING (false)`), donc ce upsert echoue silencieusement apres le premier insert.

---

### SEC-03 : SessionDetailPage lit user_reliability d'autres utilisateurs (MOYEN)

**Fichier** : `src/pages/SessionDetailPage.tsx` (lignes 143-148)

Le code fait un `SELECT` sur `user_reliability` pour chaque participant. Or la policy RLS ne permet que `auth.uid() = user_id`. Cela echoue silencieusement pour les participants tiers.

**Correction** : Utiliser la RPC existante `get_user_reliability_public`.

---

## Problemes d'Internationalisation (i18n)

### I18N-01 : Pages non internationalisees (HAUTE)

Les pages suivantes ont TOUS leurs textes hardcodes en francais :

| Page | Textes hardcodes |
|------|-----------------|
| `StatisticsPage.tsx` | "Mes statistiques", "Total rencontres", "Heures actives", "Rating moyen", "Cette semaine", noms des jours (Lun/Mar...), "Tes stats t'attendent", "Basé sur tes 100 dernières interactions" |
| `PeopleMetPage.tsx` | "Personnes rencontrees", "Aujourd'hui", "Hier", "Il y a X jours", "Aucune rencontre", "Activer mon signal", "Aucun résultat" |
| `NotificationsSettingsPage.tsx` | "Notifications", "Son des notifications", "Vibration de proximité", "Notifications push", "Non supporté", "Autorisé", "Bloqué", "Bientôt disponible" |
| `PrivacySettingsPage.tsx` | "Confidentialité", "Mode fantôme", "Distance de visibilité", "Exporter mes données", tous les textes de protection |
| `DataExportPage.tsx` | "Exporter mes données", "Droit à la portabilité", textes RGPD |
| `BlockedUsersPage.tsx` | "Débloquer", "Bloqué le...", dialogue de confirmation |
| `SessionDetailPage.tsx` | "Organisateur", "Rejoindre", "Quitter", labels d'activite, duree |
| `BinomePage.tsx` | "Réserver un Binôme", "Créer", "Explorer", "Mes créneaux", "Rejoints", "Créer un créneau", tous les toasts |

---

## Problemes de Performance / Stabilite

### PERF-01 : N+1 queries dans useSessionChat (MOYENNE)

**Fichier** : `src/hooks/useSessionChat.ts` (lignes 42-49)

Pour chaque message, un appel RPC individuel `get_public_profile_secure` est effectue. Avec 20 messages de 5 users, cela fait 20 appels au lieu de 5.

**Correction** : Collecter les `user_id` uniques, faire un seul appel `get_public_profiles` avec le tableau d'IDs, puis mapper les resultats.

---

### PERF-02 : N+1 queries dans SessionDetailPage (MOYENNE)

**Fichier** : `src/pages/SessionDetailPage.tsx` (lignes 139-163)

Pour chaque participant, 2 requetes sequentielles : `get_public_profile_secure` et `user_reliability SELECT`. Avec 10 participants, cela fait 20 requetes.

**Correction** : Batch les appels avec `get_public_profiles` + `get_user_reliability_public`.

---

### PERF-03 : useSessionChat dependencies instables (BASSE)

**Fichier** : `src/hooks/useSessionChat.ts` (ligne 122)

Le `useEffect` inclut `fetchSenderProfile`, `showNotification` et `isSubscribed` dans ses dependencies. Si ces fonctions ne sont pas stables (pas memoized), le canal Realtime se re-souscrit a chaque render.

**Correction** : Retirer les dependencies non necessaires et utiliser des refs pour les callbacks.

---

## Problemes UX / Fonctionnels

### UX-01 : GDPR dataRetentionInfo non traduit

**Fichier** : `src/hooks/useGdprExport.ts` (ligne 133)

Le texte `dataRetentionInfo` est hardcode en francais dans les donnees exportees.

---

### UX-02 : Dates formatees exclusivement en francais

**Fichier** : `src/pages/BlockedUsersPage.tsx` (ligne 88), `src/pages/PeopleMetPage.tsx` (ligne 82)

`toLocaleDateString('fr-FR')` et noms de jours hardcodes (`Lun`, `Mar`...) dans StatisticsPage ne respectent pas la langue selectionnee.

---

## Plan de Corrections

### Etape 1 : Securite (RPC pour QR check-in)

Creer une migration SQL avec la fonction RPC :
```sql
CREATE OR REPLACE FUNCTION public.check_in_event_by_qr(p_event_id uuid, p_qr_secret text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
```

Modifier `useEvents.ts` pour utiliser cette RPC au lieu de la lecture directe.

### Etape 2 : Corriger useBinomeSessions reliability

Supprimer le upsert direct sur `user_reliability` dans `createSession`. Le trigger `increment_session_count` gere deja le comptage.

### Etape 3 : Corriger SessionDetailPage RLS

Remplacer le SELECT direct sur `user_reliability` par `get_user_reliability_public`. Remplacer les appels N+1 par un batch via `get_public_profiles`.

### Etape 4 : i18n des 8 pages restantes

Ajouter environ 120 nouvelles cles de traduction dans `translations.ts` couvrant les blocs :
- `statistics.*` (~25 cles)
- `peopleMet.*` (~15 cles)
- `notifications.*` (~20 cles)
- `privacySettings.*` (~20 cles)
- `dataExport.*` (~15 cles)
- `blockedUsers.*` (~10 cles)
- `sessionDetail.*` (~15 cles)

Refactoriser chaque page pour utiliser `useTranslation()`.

### Etape 5 : Optimisation N+1

Refactoriser `useSessionChat` et `SessionDetailPage` pour batch les appels profils.

### Etape 6 : Dates localisees

Utiliser `date-fns` avec `locale` dynamique (`fr`/`enUS`) dans toutes les pages qui formatent des dates. Remplacer `toLocaleDateString('fr-FR')` par un appel respectant la preference i18n.

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| Migration SQL | Nouvelle RPC `check_in_event_by_qr` |
| `src/hooks/useEvents.ts` | Utiliser RPC pour check-in |
| `src/hooks/useBinomeSessions.ts` | Supprimer upsert reliability |
| `src/hooks/useSessionChat.ts` | Batch profils, stabiliser deps |
| `src/pages/SessionDetailPage.tsx` | RPC reliability + batch + i18n |
| `src/pages/StatisticsPage.tsx` | i18n complete |
| `src/pages/PeopleMetPage.tsx` | i18n complete + dates localisees |
| `src/pages/NotificationsSettingsPage.tsx` | i18n complete |
| `src/pages/PrivacySettingsPage.tsx` | i18n complete |
| `src/pages/DataExportPage.tsx` | i18n complete |
| `src/pages/BlockedUsersPage.tsx` | i18n complete + dates |
| `src/pages/BinomePage.tsx` | i18n complete |
| `src/hooks/useGdprExport.ts` | i18n dataRetentionInfo |
| `src/lib/i18n/translations.ts` | +120 cles |

---

## Estimation

- Securite (RPC + corrections RLS) : 3 fichiers + 1 migration
- i18n (8 pages) : ~120 nouvelles cles + 8 refactorisations
- Performance (N+1) : 2 fichiers
- Total : ~14 fichiers modifies, ~400 lignes ajoutees/modifiees
