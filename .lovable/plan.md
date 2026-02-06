
# Audit Beta-Testeur Complet - EASY v1.7.0

## Resume Executif

Audit exhaustif de toutes les pages et fonctionnalites de l'application, du point de vue utilisateur final.

---

## Points Valides (OK)

| Zone | Statut | Details |
|------|--------|---------|
| Landing Page | OK | Hero, features, traductions FR/EN fonctionnelles |
| Toggle langue FR/EN | OK | Changement instantane, persistance correcte |
| Banniere cookies | OK | Traduite, boutons Accept/Decline fonctionnels |
| Page 404 | OK | Message traduit, bouton retour accueil |
| Page CGU/Terms | OK | Contenu complet, navigation |
| Page Confidentialite | OK | RGPD, informations claires |
| Page A propos | OK | Mission, equipe, valeurs, contact |
| Page Aide/FAQ | OK | Accordeon, recherche, version v1.7.0 |
| Page Installation PWA | OK | Instructions claires par OS |
| Page Changelog | OK | v1.7.0 en premier, historique complet |
| Protection routes | OK | Redirection vers landing + toast "Connecte-toi" |
| Page Onboarding | OK | Formulaire, OAuth Google/Apple, force MDP |
| Page Parametres | OK | Langue, theme, notifications, i18n complet |
| Mot de passe oublie | OK | Formulaire fonctionne, rate limiting actif |

---

## Problemes Identifies

### Priorite HAUTE

| # | Probleme | Impact Utilisateur | Fichier |
|---|----------|-------------------|---------|
| 1 | Erreur mot de passe "pwned" non traduite | Utilisateur voit message anglais cryptique du serveur | OnboardingPage.tsx |
| 2 | Page ForgotPasswordPage non i18n | Textes hardcodes en francais uniquement | ForgotPasswordPage.tsx |
| 3 | Page ResetPasswordPage non i18n | Textes hardcodes en francais uniquement | ResetPasswordPage.tsx |
| 4 | Page ChangePasswordPage non i18n | Textes hardcodes en francais uniquement | ChangePasswordPage.tsx |
| 5 | Page PremiumPage non i18n | Toutes les features en francais hardcode | PremiumPage.tsx |

### Priorite MOYENNE

| # | Probleme | Impact | Fichier |
|---|----------|--------|---------|
| 6 | Indicateur force MDP trompeur | Affiche "Fort" meme si serveur rejette | PasswordStrengthIndicator.tsx |

---

## Corrections a Appliquer

### 1. Ajouter traduction erreur "weak_password"

Dans `src/lib/i18n/translations.ts`, ajouter dans le bloc `auth`:

```text
weakPassword: { 
  en: 'This password is too common. Please choose a different one.', 
  fr: 'Ce mot de passe est trop courant. Choisis-en un autre.' 
},
```

Dans `src/pages/OnboardingPage.tsx`, modifier la gestion d'erreur signup (ligne ~183):

```text
if (error.message.includes('weak_password') || error.message.includes('pwned')) {
  toast.error(t('auth.weakPassword'));
} else if (error.message.includes('User already registered')) {
  ...
}
```

### 2. Internationaliser ForgotPasswordPage

Remplacer tous les textes hardcodes par des appels `t()`:
- "Email requis" -> `t('auth.emailRequired')`
- "Email invalide" -> `t('auth.invalidEmail')`
- "Trop de tentatives" -> `t('auth.tooManyAttempts')`
- "Mot de passe oublie" -> `t('auth.forgotPassword')`
- "Renitialise ton mot de passe" -> ajouter cle `auth.resetPasswordTitle`
- "Email envoye !" -> ajouter cle `auth.emailSent`
- etc.

### 3. Internationaliser ResetPasswordPage

Memes modifications que ForgotPasswordPage.

### 4. Internationaliser ChangePasswordPage

Ajouter les cles de traduction manquantes et utiliser `useTranslation()`.

### 5. Internationaliser PremiumPage

Ajouter un bloc `premium` dans translations.ts avec toutes les features Easy+.

### 6. Ajouter note sur validation serveur

Dans `PasswordStrengthIndicator.tsx`, ajouter une indication que le serveur peut rejeter meme un mot de passe "fort" s'il est dans une liste de mots de passe compromis.

---

## Section Technique

### Nouvelles cles i18n a ajouter

```text
// Auth
auth.weakPassword
auth.resetPasswordTitle
auth.resetPasswordDesc
auth.emailSent
auth.emailSentDesc
auth.linkExpired
auth.linkExpiredDesc
auth.newLink
auth.currentPassword
auth.newPassword
auth.confirmPassword
auth.passwordsMatch
auth.passwordsDontMatch
auth.changePassword
auth.passwordChanged
auth.sessionExpired
auth.passwordRequirements

// Premium
premium.title
premium.yourSessions
premium.purchased
premium.freeTitle
premium.yourPlan
premium.sessionUnit
premium.perSession
premium.buyMore
premium.neverExpires
premium.easyPlusTitle
premium.perMonth
premium.recommended
premium.subscribe
premium.manageSubscription
premium.welcomeEasyPlus
premium.renewsOn
premium.unlimitedSessions
premium.liveMode
premium.ghostMode
premium.prioritySupport
premium.premiumBadge
premium.termsNote
```

### Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| src/lib/i18n/translations.ts | +50 nouvelles cles |
| src/pages/OnboardingPage.tsx | Gestion erreur weak_password |
| src/pages/ForgotPasswordPage.tsx | Import useTranslation + remplacements |
| src/pages/ResetPasswordPage.tsx | Import useTranslation + remplacements |
| src/pages/ChangePasswordPage.tsx | Import useTranslation + remplacements |
| src/pages/PremiumPage.tsx | Import useTranslation + remplacements |
| src/components/PasswordStrengthIndicator.tsx | Ajout note serveur |

---

## Tests Additionnels Recommandes

Ajouter dans la suite de tests:
- Test de l'erreur "weak_password" traduite
- Test de la page ForgotPassword en anglais
- Test de la page Premium en anglais
- Test de coherence i18n sur toutes les pages d'authentification

---

## Resultat Attendu

Apres corrections:
- 100% des textes visibles traduits FR/EN
- Messages d'erreur serveur traduits et comprehensibles
- Experience utilisateur coherente quelle que soit la langue
- Aucun texte hardcode restant dans les pages d'authentification et premium
