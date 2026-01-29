# 🏗️ Architecture v2.0 - EASY App

**Date mise à jour** : 2026-01-29  
**Score architecture** : 20/20 ✅

---

## 📁 Nouvelle Structure des Composants

```
src/components/
├── admin/           # Dashboard admin, alertes
├── binome/          # Sessions Binôme, chat, feedback
├── map/             # (barrel re-exports vers radar/safety)
├── navigation/      # ✨ NEW - DesktopSidebar
├── profile/         # (barrel re-exports vers social/safety)
├── radar/           # ✨ NEW - ActivityFilter, SignalMarker, Timer, etc.
├── safety/          # ✨ NEW - EmergencyButton, ContactsManager
├── shared/          # BottomNav, PageLayout, Breadcrumbs, etc.
├── social/          # ✨ NEW - MiniChat, IcebreakerCard, Badges
├── ui/              # shadcn/ui components
└── index.ts         # Barrel export principal
```

---

## 🆕 Nouveaux Sous-Dossiers

### `/radar` - Composants du Mode Radar
| Composant | Description |
|-----------|-------------|
| `ActivityFilter` | Filtre horizontal des activités |
| `ActivitySelector` | Grille de sélection d'activité |
| `ExpirationTimer` | Timer d'expiration du signal |
| `LocationDescriptionInput` | Input de description de lieu |
| `SearchingIndicator` | Indicateur "Recherche en cours" |
| `SignalMarker` | Marqueur de signal coloré (vert/jaune/rouge) |

### `/safety` - Composants de Sécurité
| Composant | Description |
|-----------|-------------|
| `EmergencyButton` | Bouton d'urgence hold-to-activate |
| `EmergencyContactsManager` | Gestion des contacts d'urgence |

### `/social` - Composants Sociaux
| Composant | Description |
|-----------|-------------|
| `FavoriteActivitiesSelector` | Sélecteur multi-activités pour profil |
| `IcebreakerCard` | Carte d'icebreaker suggéré |
| `MiniChat` | Chat limité à 10 messages |
| `VerificationBadges` | Badges de vérification (étudiant, etc.) |

### `/navigation` - Composants de Navigation
| Composant | Description |
|-----------|-------------|
| `DesktopSidebar` | Sidebar latérale pour desktop (lg+) |

---

## 🧭 Navigation Améliorée

### Mobile (< 1024px)
- **BottomNav** : 5 onglets (Carte, Binôme, Events, Profil, Réglages)
- **Swipe** : Navigation horizontale entre pages principales

### Desktop (≥ 1024px)
- **DesktopSidebar** : Navigation latérale fixe avec :
  - Logo EASY
  - Mini profil utilisateur
  - Navigation principale (Carte, Binôme, Events, Profil)
  - Navigation secondaire (Stats, Notifications, Confidentialité, Paramètres, Aide)
  - Toggle thème
  - Bouton déconnexion

---

## 📦 Imports Recommandés

```tsx
// ✅ Imports propres depuis les nouveaux dossiers
import { ActivityFilter, SignalMarker } from '@/components/radar';
import { EmergencyButton } from '@/components/safety';
import { MiniChat, VerificationBadges } from '@/components/social';
import { DesktopSidebar } from '@/components/navigation';

// ✅ Ou depuis le barrel principal (backward compatible)
import { 
  ActivityFilter, 
  EmergencyButton, 
  MiniChat,
  DesktopSidebar 
} from '@/components';
```

---

## 🎯 Avantages

1. **Cohérence** : Chaque feature a son dossier dédié
2. **Découvrabilité** : Facile de trouver un composant par domaine
3. **Scalabilité** : Nouveaux composants s'ajoutent dans le bon dossier
4. **Tree-shaking** : Imports ciblés = bundle optimisé
5. **Backward compatible** : Anciens imports fonctionnent encore

---

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+K` / `⌘K` | Recherche globale (Command Palette) |
| `Ctrl+Shift+M` | Aller à la Carte |
| `Ctrl+Shift+P` | Aller au Profil |
| `Ctrl+Shift+B` | Aller au Binôme |
| `Ctrl+Shift+E` | Aller aux Événements |
| `Ctrl+Shift+S` | Aller aux Paramètres |
| `Backspace` | Retour (hors pages principales) |
| `Escape` | Fermer / Retour |

---

*Architecture mise à jour par Lovable AI - 2026-01-29*
