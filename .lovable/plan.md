

## Plan : Landing page 3D immersive avec React Three Fiber

### Concept

Remplacer le composant `FloatingOrbs` (blurs CSS statiques) par une scène 3D WebGL plein écran en arrière-plan du hero. L'effet : une sphère organique animée entourée de particules flottantes, réactive au scroll et au mouvement de la souris — style Apple Vision Pro / Linear 2026.

### Ce qui sera créé

**1. Installation des dépendances**
- `@react-three/fiber@^8.18` + `three@^0.170` + `@react-three/drei@^9.122.0` + `@react-three/postprocessing@^2.16`

**2. Nouveau composant : `src/components/landing/HeroScene3D.tsx`**
- Canvas R3F plein écran, `pointer-events-none`, position fixed derrière le contenu
- **Sphère organique centrale** : géométrie icosaèdre avec vertex displacement via un shader custom (bruit simplex), animée par `useFrame` — surface iridescente coral/purple avec fresnel
- **Champ de particules** : ~800 points flottants autour de la sphère, mouvement brownien lent, taille variable, couleur coral avec opacité dégressive
- **Lignes de connexion** : quelques liens dynamiques entre particules proches (style réseau social / proximité — cohérent avec le produit)
- **Réactivité souris** : la sphère suit légèrement le curseur (parallax 3D via `useThree` + lerp)
- **Réactivité scroll** : la sphère se déforme et s'éloigne au scroll (prop `scrollProgress` depuis la page)
- **Post-processing** : Bloom subtil sur les éléments lumineux + ChromaticAberration léger

**3. Shader custom GLSL (inline)**
- Vertex shader : displacement avec 3D simplex noise, animé par `uTime`
- Fragment shader : dégradé coral → purple basé sur la normale + effet fresnel pour les bords lumineux

**4. Mise à jour de `FloatingOrbs.tsx`**
- Conservé comme fallback CSS pour les appareils bas de gamme
- Détection `navigator.hardwareConcurrency` et `WebGL` support : si < 4 cores ou pas de WebGL → fallback CSS, sinon → scène 3D

**5. Mise à jour de `LandingPage.tsx`**
- Passer `scrollYProgress` à la scène 3D
- Lazy-load du composant 3D avec `React.lazy` + `Suspense` (fallback = FloatingOrbs actuels)

### Architecture technique

```text
LandingPage
├── <Suspense fallback={<FloatingOrbs />}>
│   └── <HeroScene3D scrollProgress={scrollYProgress} />  ← lazy loaded
├── LandingHeader
├── HeroSection (contenu texte, inchangé)
├── ... autres sections
```

### Performance

- Le Canvas est rendu à 0.75 dpr sur mobile pour préserver le framerate
- `frameloop="demand"` désactivé (on veut l'animation continue) mais avec `performance.regress` de drei pour adapter dynamiquement
- Les particules utilisent `InstancedMesh` (un seul draw call)
- Lazy loading = 0 impact sur le temps de chargement initial si le bundle 3D est code-split

### Sections impactées

| Fichier | Action |
|---------|--------|
| `package.json` | Ajout three, r3f, drei, postprocessing |
| `src/components/landing/HeroScene3D.tsx` | **Nouveau** — scène 3D complète |
| `src/components/landing/FloatingOrbs.tsx` | Ajout détection WebGL + logique fallback |
| `src/components/landing/index.ts` | Export du nouveau composant |
| `src/pages/LandingPage.tsx` | Lazy import + Suspense + passage scrollProgress |

