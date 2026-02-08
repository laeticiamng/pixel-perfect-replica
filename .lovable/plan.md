

# Audit Utilisateur -- Creation de Compte et Utilisation

## Resume Executif

J'ai teste l'application comme un vrai utilisateur sur mobile (390x844). Voici les resultats.

---

## Tests Effectues et Resultats

### 1. Page d'accueil (Landing Page)
- **Statut** : OK
- Le bouton "Commencer gratuitement" mene bien a la page d'inscription
- Le bouton "Se connecter" dans le header mene a la page de connexion (mode login)

### 2. Formulaire d'inscription
- **Statut** : OK
- Les champs email, mot de passe, prenom et universite (optionnel) sont presents
- L'indicateur de force du mot de passe s'affiche correctement
- Le toggle "J'ai deja un compte ? Se connecter" fonctionne dans les deux sens

### 3. Validation du formulaire
- **Statut** : OK
- Un mot de passe faible ("abc") est correctement rejete avec des messages specifiques : "Mot de passe trop court", "Doit contenir au moins une majuscule", "Doit contenir au moins un chiffre"
- La validation Zod (`registerSchema`) fonctionne bien

### 4. Rejet des mots de passe compromis
- **Statut** : OK (avec remarque)
- Le mot de passe "Test123!" est rejete par le backend car present dans des fuites de donnees (base HaveIBeenPwned)
- Le message d'erreur affiche est correct : toast d'erreur pour mot de passe faible
- **Remarque** : Le message pourrait etre plus explicite ("Ce mot de passe a ete trouve dans une fuite de donnees, choisissez-en un autre")

### 5. Ecran de confirmation email
- **Statut** : OK
- Apres inscription reussie avec un mot de passe fort, l'ecran "Verifiez votre boite email" s'affiche correctement
- L'adresse email est affichee
- Le bouton "Renvoyer l'email" fonctionne
- Le bouton "J'ai confirme, me connecter" bascule en mode login

### 6. Login avec email non confirme
- **Statut** : OK
- Tenter de se connecter avec un compte non confirme affiche l'ecran de confirmation email avec l'option de renvoi

### 7. Protection des pages
- **Statut** : OK
- Acceder a `/map` sans etre connecte redirige vers `/onboarding` en mode login
- Un toast "Connexion requise" s'affiche

### 8. Navigation directe vers /onboarding
- **Statut** : OK
- Arriver sur `/onboarding` via un lien direct affiche le formulaire d'inscription par defaut
- La bascule login/signup est disponible en bas de page

---

## Problemes Identifies

### PROBLEME 1 -- MINEUR : Message mot de passe compromis pas assez clair

Le message affiche quand un mot de passe est present dans la base HaveIBeenPwned n'explique pas clairement pourquoi le mot de passe est rejete. L'utilisateur voit "Mot de passe trop faible" alors que le vrai probleme est que le mot de passe a fuite.

**Suggestion** : Ajouter une traduction specifique pour `auth.pwnedPassword` : "Ce mot de passe a ete trouve dans une fuite de donnees. Veuillez en choisir un autre." / "This password was found in a data breach. Please choose a different one."

### PROBLEME 2 -- MINEUR : Pas de pre-remplissage email apres confirmation

Quand l'utilisateur clique "J'ai confirme, me connecter", le formulaire de login s'affiche mais l'email n'est pas forcement pre-rempli (il reste dans le state `email` mais l'experience pourrait etre plus fluide avec un texte indiquant l'email pre-rempli).

---

## Conclusion

Les 5 corrections implementees precedemment fonctionnent correctement :
1. L'ecran de confirmation email s'affiche bien quand la session est nulle
2. La validation Zod rejette les mots de passe faibles avec des messages precis
3. Le toggle login/signup fonctionne
4. Le renvoi d'email de confirmation fonctionne
5. Les routes protegees redirigent correctement

**Le flux de creation de compte est fonctionnel.** Les seules ameliorations restantes sont cosmetiques (message mot de passe compromis plus explicite).

---

## Section Technique

### Changement propose

**Fichier** : `src/pages/OnboardingPage.tsx` (ligne ~191)

Actuellement le code verifie `error.message.includes('weak_password') || error.message.includes('pwned')` et affiche `t('auth.weakPassword')`. Il faudrait differencier les deux cas :
- Si `pwned` : afficher un message specifique expliquant la fuite de donnees
- Si `weak_password` sans `pwned` : garder le message actuel

**Fichier** : `src/lib/i18n/translations.ts`

Ajouter :
- `auth.pwnedPassword` : "Ce mot de passe a ete trouve dans une fuite de donnees. Choisissez-en un autre." / "This password was found in a data breach. Please choose a different one."

