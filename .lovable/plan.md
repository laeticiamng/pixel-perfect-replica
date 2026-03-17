

## Plan : 3D immersive next-gen — Upgrade complet

### Analyse de l'existant

La scène actuelle (`HeroScene3D.tsx`) est une bonne base mais reste assez classique : une sphère avec noise displacement, des particules basiques et des lignes de connexion. Pour atteindre un niveau "2026 premium", voici les améliorations majeures.

### Améliorations du composant HeroScene3D

**1. Sphère organique — Shader upgrade**
- Ajouter un **3e octave de noise** (FBM) pour une surface plus détaillée et vivante
- Implémenter un **environment map reflection** simulé dans le fragment shader (faux reflets dynamiques)
- Ajouter un **rim lighting pulsant** qui respire lentement (sinusoïdal)
- **Iridescence spectrale** : le dégradé coral/purple se déplace sur la surface en fonction de l'angle de vue (thin-film interference simulé)
- Ajouter un **inner glow** : une 2e sphère légèrement plus petite, semi-transparente, avec un shader émissif chaud

**2. Particules — Points shader custom**
- Remplacer les `InstancedMesh` spheres par un **Points system avec un vertex/fragment shader custom**
- Chaque particule a une **taille variable animée** (pulse) et un **glow individuel** via point sprite
- Ajouter un **trail effect** : les particules laissent une trace éphémère (via opacity decay sur les positions précédentes)
- Augmenter à ~1200 particules (points shader = beaucoup plus performant que instanced mesh)

**3. Lignes de connexion — Glow lines**
- Remplacer `lineBasicMaterial` par un **shader custom** avec **gradient d'opacité** le long de chaque ligne (plus lumineux au centre, fade aux extrémités)
- Ajouter une **animation de pulse** sur les connexions (comme un signal qui se propage entre les nœuds)
- Les lignes les plus proches de la sphère sont plus brillantes

**4. Nouveaux éléments visuels**
- **Orbital rings** : 2-3 anneaux lumineux (torus très fins) qui orbitent autour de la sphère à différentes inclinaisons, avec un shader émissif coral/gold
- **Volumetric light rays** : via le post-processing God Rays effect (ou un fake via des planes orientées caméra avec un gradient radial animé)
- **Depth of field subtil** : les éléments éloignés deviennent légèrement flous

**5. Post-processing upgrade**
- Augmenter le Bloom avec **multi-pass** (luminanceThreshold plus bas pour les éléments émissifs)
- Ajouter **Vignette** sombre sur les bords pour centrer l'attention
- Ajouter **Noise/Film grain** très subtil pour un rendu cinématique
- Améliorer le **ChromaticAberration** pour qu'il soit radial (plus fort sur les bords)

**6. Interactivité souris améliorée**
- La sphère **se déforme localement** vers le curseur (attractor point dans le vertex shader)
- Les particules proches du curseur **s'écartent** (repulsion field)
- Transition scroll plus dramatique : la sphère **se fragmente** progressivement au scroll (les vertices s'éloignent du centre)

### Fichiers impactés

| Fichier | Action |
|---------|--------|
| `src/components/landing/HeroScene3D.tsx` | Rewrite complet avec tous les upgrades ci-dessus |

### Performance

- Le passage de InstancedMesh à Points pour les particules **améliore** la performance (1 draw call, pas de matrix updates)
- Les orbital rings sont des geometries très légères (torus avec peu de segments)
- Le post-processing reste le même nombre de passes, juste des paramètres ajustés
- L'inner glow sphere est une simple sphère avec un shader basique
- Le fallback CSS reste inchangé pour les appareils faibles

