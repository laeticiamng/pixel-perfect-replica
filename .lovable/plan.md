

# Iteration 22 -- Fix database trigger `handle_new_user()`

## Probleme identifie

La fonction SQL `handle_new_user()` utilise `'Utilisateur'` comme valeur par defaut pour `first_name` lors de la creation d'un nouveau profil (ligne 71 de la migration initiale). C'est la derniere chaine francaise hardcodee dans tout le projet.

```sql
-- Actuel
COALESCE(NEW.raw_user_meta_data->>'first_name', 'Utilisateur')

-- Corrige
COALESCE(NEW.raw_user_meta_data->>'first_name', 'User')
```

## Plan

### Etape unique : Migration SQL

Creer une migration qui remplace la fonction `handle_new_user()` avec le fallback `'User'` au lieu de `'Utilisateur'`.

La fonction conserve la meme logique (SECURITY DEFINER, insertion dans profiles/user_stats/user_settings), seul le default change.

## Impact

- 1 migration SQL
- 0 fichiers frontend modifies
- Les utilisateurs existants ne sont pas affectes (leur `first_name` est deja enregistre)
- Les nouveaux inscrits qui ne fournissent pas de prenom verront "User" au lieu de "Utilisateur"

Apres cette correction, le projet est 100% conforme i18n sur toutes les couches (frontend + backend).

