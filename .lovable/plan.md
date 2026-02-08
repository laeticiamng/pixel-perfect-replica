

# Audit Complet -- Creation de Compte (Beta Testeur)

## Bugs Identifies

### BUG 1 -- BLOQUANT : Pas de gestion de la confirmation email

**Fichier** : `src/pages/OnboardingPage.tsx` lignes 192-204
**Fichier** : `src/hooks/useSupabaseAuth.ts` lignes 142-193

**Probleme** : Apres `signUp()`, quand la confirmation email est activee (comportement par defaut), Supabase retourne `data.user` mais `data.session = null`. Le code actuel :
1. Ne verifie pas si `data.session` est null
2. Affiche "Compte cree avec succes !" (toast succes)
3. Redirige vers `/welcome`
4. L'utilisateur arrive sur `/welcome` sans session, puis va sur `/map` (protege) et se fait rejeter avec "Connexion requise"

L'utilisateur ne voit JAMAIS le message "Verifiez votre email".

**Fix** : Dans `OnboardingPage.tsx`, apres le signup reussi, verifier si `data.session` est null. Si oui, afficher un ecran "Verifiez votre email" au lieu de rediriger vers `/welcome`.

---

### BUG 2 -- MAJEUR : Validation mot de passe desynchro

**Fichier** : `src/pages/OnboardingPage.tsx` ligne 135
**Fichier** : `src/lib/validation.ts` lignes 9-15

**Probleme** : Le formulaire valide le mot de passe avec `password.length < 6` uniquement. Mais le `passwordSchema` dans validation.ts exige aussi une majuscule, une minuscule ET un chiffre. Le `registerSchema` existe mais n'est jamais utilise dans le signup.

Resultat : l'utilisateur peut soumettre "abcdef" qui passe la validation frontend mais est rejete par Supabase avec un message d'erreur vague.

**Fix** : Utiliser `registerSchema` (ou au minimum `passwordSchema`) pour valider le formulaire signup, pas juste un check de longueur.

---

### BUG 3 -- MAJEUR : Pas de bascule Login/Signup sur la page

**Fichier** : `src/pages/OnboardingPage.tsx`

**Probleme** : `isLogin` est passe via `location.state` au moment de la navigation. Il n'y a AUCUN bouton "J'ai deja un compte" ou "Creer un compte" sur la page elle-meme. Si un utilisateur arrive sur `/onboarding` directement (lien, bookmark, redirect), il est TOUJOURS en mode signup, sans moyen de basculer en login.

**Fix** : Ajouter un lien cliquable en bas du formulaire : "J'ai deja un compte ? Se connecter" / "Pas de compte ? Creer un compte" qui bascule `isLogin` via un `useState` local.

---

### BUG 4 -- MOYEN : Profile update echoue silencieusement

**Fichier** : `src/hooks/useSupabaseAuth.ts` lignes 167-191

**Probleme** : `updateProfileWithRetry` s'execute immediatement apres signup, meme quand l'utilisateur n'a pas confirme son email. Sans session active, la politique RLS `auth.uid() = id` bloque l'update. Les 3 tentatives echouent silencieusement. Le `first_name` et `university` ne sont jamais persistes au-dela de `raw_user_meta_data`.

**Fix** : Ne pas lancer `updateProfileWithRetry` si `data.session` est null. Le trigger `handle_new_user` utilise deja `raw_user_meta_data->>'first_name'`, donc le prenom est sauvegarde via le trigger. L'update supplementaire n'est necessaire qu'apres confirmation (quand l'utilisateur se connecte pour la premiere fois).

---

### BUG 5 -- MOYEN : Erreur "Email not confirmed" mal geree au login

**Fichier** : `src/pages/OnboardingPage.tsx` ligne 170-171

**Probleme** : Le message affiche est `t('auth.confirmEmail')` = "Veuillez confirmer votre email" -- mais sans bouton pour renvoyer l'email de confirmation. L'utilisateur est bloque.

**Fix** : Ajouter un bouton "Renvoyer l'email de confirmation" qui appelle `supabase.auth.resend({ type: 'signup', email })`.

---

## Plan de Corrections (5 changements)

### 1. OnboardingPage.tsx -- Ecran "Verifiez votre email"

- Ajouter un state `showEmailConfirmation` (boolean) et stocker l'email utilisee
- Apres signup reussi sans session : afficher un ecran avec icone Mail, texte "Verifiez votre boite email", et bouton "Renvoyer l'email"
- Ne PAS rediriger vers `/welcome`
- Ajouter un bouton "J'ai confirme, me connecter" qui bascule en mode login

### 2. OnboardingPage.tsx -- Validation avec registerSchema

- Remplacer la validation manuelle (lignes 130-147) par `registerSchema.safeParse({ email, password, firstName, university })`
- Afficher les erreurs specifiques (majuscule, chiffre, etc.) directement sous les champs

### 3. OnboardingPage.tsx -- Toggle Login/Signup

- Convertir `isLogin` de `const` a `useState` initialise depuis `location.state`
- Ajouter en bas du formulaire (step 1) un lien : "J'ai deja un compte ? Se connecter" / "Pas de compte ? S'inscrire"
- Reset le formulaire et les erreurs au changement de mode

### 4. useSupabaseAuth.ts -- Guard profile update

- Conditionner `updateProfileWithRetry` a `data.session !== null`
- Le trigger `handle_new_user` gere deja le `first_name` via `raw_user_meta_data`

### 5. translations.ts -- Nouvelles cles i18n

Ajouter les traductions manquantes :
- `auth.checkEmail` : "Verifiez votre boite email" / "Check your email"
- `auth.checkEmailDesc` : "Un email de confirmation a ete envoye. Cliquez sur le lien pour activer votre compte." / "A confirmation email has been sent..."
- `auth.resendEmail` : "Renvoyer l'email" / "Resend email"
- `auth.emailResent` : "Email renvoye !" / "Email resent!"
- `auth.alreadyHaveAccount` : "J'ai deja un compte" / "Already have an account"
- `auth.noAccount` : "Pas encore de compte ?" / "Don't have an account?"
- `auth.passwordRequirements` : "Min. 6 caracteres, 1 majuscule, 1 minuscule, 1 chiffre" / "Min. 6 characters, 1 uppercase, 1 lowercase, 1 digit"

