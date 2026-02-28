
# Creation de la table `connections` et RLS policies

## Contexte

Le hook `useConnections.ts` et le composant `ConnectionRequestsPanel.tsx` tentent de lire/ecrire dans une table `connections` qui n'existe pas encore dans la base de donnees. Cela provoque des erreurs console repetees a chaque login (`[ERROR] [API] select on connections failed`).

## Migration SQL

Creation d'une table `connections` avec les colonnes exactes attendues par le hook :

```text
connections
-----------
id            uuid        PK, default gen_random_uuid()
user_a        uuid        NOT NULL (le plus petit UUID)
user_b        uuid        NOT NULL (le plus grand UUID)
signal_id     uuid        NULLABLE (reference optionnelle au signal d'origine)
activity      activity_type NOT NULL
status        text        NOT NULL, default 'pending' ('pending' | 'accepted' | 'declined')
initiated_by  uuid        NOT NULL
accepted_at   timestamptz NULLABLE
created_at    timestamptz NOT NULL, default now()
updated_at    timestamptz NOT NULL, default now()
```

**Contraintes** :
- `UNIQUE(user_a, user_b)` -- une seule connexion par paire d'utilisateurs
- Le hook impose `user_a < user_b` (canonical ordering) cote client

**Trigger** :
- `update_updated_at_column` sur UPDATE (reutilise le trigger existant)

**Realtime** :
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.connections` pour le realtime deja cable dans le hook

## RLS Policies (5 regles)

| Commande | Nom | Expression |
|----------|-----|------------|
| SELECT | Users can view own connections | `auth.uid() = user_a OR auth.uid() = user_b` |
| INSERT | Users can create connection requests | `auth.uid() = initiated_by AND (auth.uid() = user_a OR auth.uid() = user_b)` |
| UPDATE | Users can update own connections | `auth.uid() = user_a OR auth.uid() = user_b` |
| DELETE | Users can delete own connections | `auth.uid() = user_a OR auth.uid() = user_b` |

L'UPDATE est restreint aux participants de la connexion (le destinataire accepte/decline, l'initiateur peut annuler).

## Resultat attendu

- 0 erreur console `select on connections failed`
- Le panel de demandes de connexion fonctionne (affichage, accept, decline)
- Le realtime se connecte correctement aux channels `connections-user-a-*` et `connections-user-b-*`
- Aucune modification de code frontend necessaire (le hook est deja ecrit correctement)
