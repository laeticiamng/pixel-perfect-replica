
# Plan d'audit et corrections UX - EASY v1.7.0

## Contexte
Audit bêta-testeur complet de l'application. L'exploration a couvert : landing page, inscription/connexion, pages d'aide, d'installation, de confidentialité, Premium, et routes protégées.

---

## Résumé de l'audit

### Points positifs validés
- Traductions Apple/Google fonctionnelles
- Bannière cookies traduite FR/EN
- Protection des routes avec redirection et toast
- Responsive mobile cohérent
- FAQ accordéon fonctionnel
- Navigation swipe opérationnelle

### Bugs identifiés

| Priorite | Probleme | Fichier | Ligne |
|----------|----------|---------|-------|
| Haute | Version affiche v1.6.5 au lieu de v1.7.0 | LandingFooter.tsx | 55 |
| Haute | Version affiche v1.6.5 au lieu de v1.7.0 | HelpPage.tsx | 226 |

---

## Corrections a appliquer

### 1. Mise a jour de la version dans le footer landing
**Fichier** : `src/components/landing/LandingFooter.tsx`

Modifier la ligne 55 pour remplacer `v1.6.5` par `v1.7.0`.

### 2. Mise a jour de la version dans la page aide
**Fichier** : `src/pages/HelpPage.tsx`

Modifier la ligne 226 pour remplacer `v1.6.5` par `v1.7.0`.

---

## Ameliorations recommandees (optionnelles)

### 3. Centraliser le numero de version (bonne pratique)
Creer une constante unique pour eviter les incoherences futures :

**Nouveau fichier** : `src/lib/constants.ts`

```text
export const APP_VERSION = '1.7.0';
export const APP_NAME = 'EASY';
```

Puis l'importer dans les 3 fichiers qui affichent la version :
- LandingFooter.tsx
- HelpPage.tsx
- ProfilePage.tsx

---

## Fichiers modifies

| Fichier | Action |
|---------|--------|
| src/components/landing/LandingFooter.tsx | Correction version |
| src/pages/HelpPage.tsx | Correction version |
| src/lib/constants.ts | Creation (optionnel) |

---

## Resultat attendu
- Version v1.7.0 affichee de maniere coherente sur toute l'application
- Aucune incohérence entre les pages
- Maintenance simplifiee pour les futures mises a jour
