

# Audit Visuel Premium v2 -- Corrections Residuelles

## Methode
Inspection desktop (1920x1080) et mobile (390x844) via navigateur + lecture complete du code de tous les composants landing.

## Etat actuel
Les corrections majeures du plan v1 ont ete implementees (header glassmorphism, suppression pulse CTA, icones Lucide dans FeatureCard/UseCases/Guarantee, SocialProofBar, FinalCTA gradient, footer mobile). Cependant, **4 problemes residuels** subsistent.

---

## PROBLEME 1 -- Emojis restants dans AppPreviewSection (perception amateur)
**Localisation** : `src/components/landing/AppPreviewSection.tsx` lignes 39-49
**Constat** : La barre de navigation du mockup telephone utilise encore des emojis (pin, calendrier, groupe, profil) au lieu d'icones Lucide. Cela casse la coherence avec le reste de la page qui utilise maintenant exclusivement des icones vectorielles.
**Correction** : Remplacer les 4 emojis par des icones Lucide (`MapPin`, `Calendar`, `Users`, `User`) avec la meme taille et couleur.

## PROBLEME 2 -- Emojis restants dans SignalDemo (radar)
**Localisation** : `src/components/landing/SignalDemo.tsx` lignes 17-19
**Constat** : Les signaux animes sur le radar utilisent encore des emojis (livre, course, cafe). Meme probleme de coherence premium.
**Correction** : Remplacer par des icones Lucide (`BookOpen`, `Dumbbell`, `Coffee`) rendues en blanc ou couleur adaptee dans les cercles signal.

## PROBLEME 3 -- Emoji dans le badge "Not a dating app"
**Localisation** : `src/components/landing/HeroSection.tsx` ligne 55
**Constat** : Le badge utilise encore `⚠️` (emoji) devant le texte. Incoherent avec la direction 100% icones vectorielles.
**Correction** : Remplacer par l'icone Lucide `AlertTriangle` avec `className="h-4 w-4 text-destructive"`.

## PROBLEME 4 -- SocialProofBar manque de credibilite visuelle
**Localisation** : `src/components/landing/SocialProofBar.tsx`
**Constat** : Les chiffres (500+, 1200+, 15+) sont affiches sans contexte visuel de confiance. Ajouter un separateur visuel subtil (ligne ou `|`) entre les stats et un fond glass leger pour donner du "poids" a la barre.
**Correction** : Envelopper dans un conteneur `glass rounded-2xl py-4 px-6` et ajouter des separateurs entre les stats.

---

## Corrections techniques

| # | Fichier | Correction | Effort |
|---|---------|-----------|--------|
| 1 | `AppPreviewSection.tsx` | Remplacer 4 emojis nav par Lucide (`MapPin`, `Calendar`, `Users`, `User`) | 5 min |
| 2 | `SignalDemo.tsx` | Remplacer 3 emojis signaux par Lucide (`BookOpen`, `Dumbbell`, `Coffee`) | 5 min |
| 3 | `HeroSection.tsx` | Remplacer emoji `⚠️` par `AlertTriangle` de Lucide | 2 min |
| 4 | `SocialProofBar.tsx` | Ajouter fond glass + separateurs entre stats | 5 min |

**Total estime : ~17 minutes**

