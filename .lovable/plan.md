
# Plan : Page "A propos" + Tests E2E Signup/Signal

## Contexte
Ce plan couvre deux demandes :
1. Creation d'une page "A propos" presentant l'equipe et la mission EASY
2. Ajout de tests E2E automatises pour le parcours complet d'inscription et d'activation du signal

---

## Partie 1 : Page "A propos"

### 1.1 Structure de la page
Creer `src/pages/AboutPage.tsx` avec les sections suivantes :
- **Hero** : Titre "A propos d'EASY" avec baseline
- **Mission** : Vision et valeurs de l'application (connexions reelles, consentement mutuel)
- **Equipe** : Presentation d'EmotionsCare SASU avec membres fondateurs
- **Valeurs** : 3-4 cartes (Authenticite, Securite, Innovation, Communaute)
- **Stats** : Chiffres cles (utilisateurs, interactions, villes)
- **Contact** : Liens vers support et reseaux sociaux

### 1.2 Traductions i18n
Ajouter dans `src/lib/i18n/translations.ts` :
```text
about: {
  title: { en: 'About EASY', fr: 'A propos d\'EASY' },
  subtitle: { en: 'The platform that reinvents meetings', fr: 'La plateforme qui reinvente la rencontre' },
  missionTitle: { en: 'Our Mission', fr: 'Notre Mission' },
  missionText: { en: 'Connect real intentions...', fr: 'Connecter des intentions reelles...' },
  teamTitle: { en: 'The Team', fr: 'L\'Equipe' },
  valuesTitle: { en: 'Our Values', fr: 'Nos Valeurs' },
  contactTitle: { en: 'Contact Us', fr: 'Nous Contacter' },
  // valeurs individuelles
  authenticity: { en: 'Authenticity', fr: 'Authenticite' },
  security: { en: 'Security', fr: 'Securite' },
  innovation: { en: 'Innovation', fr: 'Innovation' },
  community: { en: 'Community', fr: 'Communaute' },
}
```

### 1.3 Fichiers a modifier

| Fichier | Action |
|---------|--------|
| `src/pages/AboutPage.tsx` | Creation (nouveau) |
| `src/pages/legal/index.ts` | Export de AboutPage |
| `src/pages/index.ts` | Pas de changement (herite de legal) |
| `src/App.tsx` | Ajouter route `/about` |
| `src/lib/i18n/translations.ts` | Ajouter section `about` |
| `src/components/landing/LandingFooter.tsx` | Ajouter lien vers /about |

### 1.4 Design
- Style coherent avec TermsPage et PrivacyPage
- Utilisation du composant PageLayout
- Icones Lucide (Users, Heart, Shield, Rocket)
- Cards glassmorphism pour les valeurs
- Responsive mobile-first

---

## Partie 2 : Tests E2E Signup + Signal

### 2.1 Fichier de tests
Creer `src/test/e2e-signup-signal.test.tsx` avec les suites suivantes :

### 2.2 Suite "Signup Flow"
```text
describe("E2E Complete Signup Flow")
  - CP-SIGNUP-001: Validate form rendering
  - CP-SIGNUP-002: Test email validation (formats valides/invalides)
  - CP-SIGNUP-003: Test password strength indicator
  - CP-SIGNUP-004: Test firstName sanitization (XSS prevention)
  - CP-SIGNUP-005: Test rate limiting simulation
  - CP-SIGNUP-006: Test successful signup flow (mock Supabase)
  - CP-SIGNUP-007: Test OAuth buttons presence (Google, Apple)
  - CP-SIGNUP-008: Test redirection to /welcome after signup
```

### 2.3 Suite "Post-Signup Onboarding"
```text
describe("E2E Post-Signup Onboarding Flow")
  - CP-ONBOARD-001: Location permission step rendering
  - CP-ONBOARD-002: Activity selection step
  - CP-ONBOARD-003: Signal activation step
  - CP-ONBOARD-004: Skip location option
  - CP-ONBOARD-005: Redirection to /map after completion
```

### 2.4 Suite "Signal Activation"
```text
describe("E2E Signal Activation Flow")
  - CP-SIGNAL-001: Signal store initial state
  - CP-SIGNAL-002: Activity selection validation
  - CP-SIGNAL-003: Signal data structure validation
  - CP-SIGNAL-004: Signal expiration (2h)
  - CP-SIGNAL-005: Signal deactivation
  - CP-SIGNAL-006: GPS coordinates validation
```

### 2.5 Suite "Map Discovery"
```text
describe("E2E Map Discovery Flow")
  - CP-MAP-001: Empty state when no nearby users
  - CP-MAP-002: Nearby users filtering by distance
  - CP-MAP-003: Ghost mode users exclusion
  - CP-MAP-004: Blocked users exclusion
  - CP-MAP-005: Demo mode toggle
```

### 2.6 Fichiers a modifier

| Fichier | Action |
|---------|--------|
| `src/test/e2e-signup-signal.test.tsx` | Creation (nouveau) |
| `src/test/e2e-flows.test.ts` | Pas de modification (tests existants conserves) |

---

## Section Technique

### Architecture des tests
```text
src/test/
  ├── setup.ts                    # Configuration existante
  ├── e2e-flows.test.ts           # Tests logiques existants
  ├── e2e-critical-paths.test.tsx # Tests composants existants
  └── e2e-signup-signal.test.tsx  # NOUVEAU - Tests E2E complets
```

### Mocks utilises
- Supabase client (auth.signUp, auth.signInWithPassword)
- framer-motion (pour eviter les erreurs d'animation)
- Navigator geolocation API
- React Router (useNavigate, useLocation)

### Patterns de test
```text
// Test de composant avec providers
const renderWithProviders = (component) => render(
  <QueryClientProvider>
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

// Test de store Zustand
const { result } = renderHook(() => useSignalStore());
act(() => result.current.activateSignal('studying'));
expect(result.current.mySignal).toBe('green');
```

---

## Resultat attendu

### Page About
- Accessible via `/about`
- Lien dans le footer de la landing page
- Traductions FR/EN completes
- Design coherent avec le reste de l'app

### Tests E2E
- ~25 nouveaux tests couvrant le parcours complet
- Validation du signup (email, password, firstName)
- Validation de l'onboarding (location, activity, signal)
- Validation de la decouverte sur la map
- Tous les tests passent avec `vitest run`

---

## Estimation
- Page About : ~150 lignes de code
- Tests E2E : ~350 lignes de tests
- Traductions : ~30 nouvelles cles
