# 🔐 Architecture de Sécurité - Documentation Finale

**Version :** 1.3.0  
**Date :** 30 janvier 2026  
**Statut :** ✅ Production Ready

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Authentification](#authentification)
3. [Autorisation & RLS](#autorisation--rls)
4. [Protection des Données](#protection-des-données)
5. [Edge Functions Sécurisées](#edge-functions-sécurisées)
6. [Anti-Abus & Rate Limiting](#anti-abus--rate-limiting)
7. [Conformité RGPD](#conformité-rgpd)
8. [Audit Trail](#audit-trail)
9. [Checklist de Sécurité](#checklist-de-sécurité)

---

## 🎯 Vue d'Ensemble

### Stack Sécurité

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Input Valid │  │ XSS Protect │  │ Sanitization (Zod)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     EDGE FUNCTIONS                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ JWT Verify  │  │ Role Check  │  │ Input Validation    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ RLS Policies│  │ RPC Secure  │  │ Triggers/Functions  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Principes de Sécurité

| Principe | Implémentation |
|----------|----------------|
| **Defense in Depth** | Multi-couches : Frontend → Edge → RLS → DB |
| **Least Privilege** | Accès minimal par défaut, extension explicite |
| **Zero Trust** | Validation à chaque couche, pas de confiance implicite |
| **Secure by Default** | RLS activé, auth requise, secrets protégés |

---

## 🔑 Authentification

### Flux d'Authentification

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │───▶│ Supabase │───▶│  Email   │───▶│ Verified │
│  Signup  │    │   Auth   │    │  Confirm │    │  Account │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Configuration Auth

```typescript
// Supabase Auth Settings
{
  auto_confirm_email: false,      // Email verification required
  disable_signup: false,          // Signup enabled
  external_anonymous_users: false // No anonymous access
}
```

### Protection des Sessions

| Mesure | Détail |
|--------|--------|
| **JWT Expiration** | 1 heure (refresh automatique) |
| **Refresh Token** | 7 jours, rotation à chaque usage |
| **Session Binding** | Lié à l'IP et User-Agent |
| **Logout** | Invalidation côté serveur |

### Sécurité des Mots de Passe

```typescript
// Validation côté client (lib/validation.ts)
const passwordSchema = z.string()
  .min(8, "Minimum 8 caractères")
  .regex(/[A-Z]/, "Une majuscule requise")
  .regex(/[a-z]/, "Une minuscule requise")
  .regex(/[0-9]/, "Un chiffre requis")
  .regex(/[^A-Za-z0-9]/, "Un caractère spécial requis");
```

---

## 🛡️ Autorisation & RLS

### Architecture des Rôles

```sql
-- Table des rôles (séparée des profiles pour éviter privilege escalation)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL, -- 'admin', 'moderator', 'user'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Fonction sécurisée de vérification des rôles
CREATE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### Matrice RLS par Table

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | Own only | Own only | Own only | ❌ |
| `active_signals` | Nearby + !ghost | Own only | Own only | Own only |
| `scheduled_sessions` | City-based | Own only | Creator only | Creator only |
| `session_participants` | Session members | Join via RPC | Own only | Leave via RPC |
| `messages` | Interaction members | Own only | ❌ | ❌ |
| `reports` | Admin only | Own only | ❌ | Admin only |
| `user_reliability` | Own + Admin | System RPC | System RPC | ❌ |
| `emergency_contacts` | Own only | Own only | Own only | Own only |
| `user_roles` | ❌ | Admin only | ❌ | Admin only |

### Exemples de Policies RLS

```sql
-- Profiles: Lecture propre uniquement
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Signals: Visibilité basée sur la proximité et le mode fantôme
CREATE POLICY "Users can view nearby signals" ON public.active_signals
FOR SELECT USING (
  expires_at > now()
  AND user_id != auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM public.user_settings 
    WHERE user_id = active_signals.user_id AND ghost_mode = true
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_blocks 
    WHERE (blocker_id = auth.uid() AND blocked_id = active_signals.user_id)
       OR (blocker_id = active_signals.user_id AND blocked_id = auth.uid())
  )
);

-- User Reliability: Aucune modification directe (système uniquement)
CREATE POLICY "System updates reliability via RPC" ON public.user_reliability
FOR UPDATE USING (false) WITH CHECK (false);
```

---

## 🔒 Protection des Données

### Données Sensibles

| Donnée | Protection | Accès |
|--------|------------|-------|
| **Email** | RLS + RPC filtré | Propriétaire uniquement |
| **Téléphone (urgence)** | RLS strict | Propriétaire uniquement |
| **Coordonnées GPS** | Fuzzing ~100m | Utilisateurs proches |
| **QR Secrets (events)** | RPC filtré | Organisateur uniquement |
| **Tokens API** | Secrets Supabase | Edge functions uniquement |

### Fuzzing des Coordonnées

```sql
-- Arrondi à 3 décimales ≈ 100m de précision
CREATE FUNCTION public.fuzz_coordinates(lat NUMERIC, lon NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'lat', ROUND(lat::numeric, 3),
    'lon', ROUND(lon::numeric, 3)
  );
END;
$$;

-- Trigger automatique sur les interactions
CREATE FUNCTION public.validate_interaction_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL THEN
    NEW.latitude := ROUND(NEW.latitude::numeric, 3);
  END IF;
  IF NEW.longitude IS NOT NULL THEN
    NEW.longitude := ROUND(NEW.longitude::numeric, 3);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Sanitization des Entrées

```typescript
// lib/sanitize.ts
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Supprime < et >
    .replace(/javascript:/gi, '') // Supprime les URIs JS
    .replace(/on\w+=/gi, '') // Supprime les event handlers
    .trim()
    .slice(0, 1000); // Limite de longueur
};

export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};
```

---

## ⚡ Edge Functions Sécurisées

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Edge Function                            │
│                                                              │
│  1. CORS Headers                                             │
│     └─ Access-Control-Allow-Origin: *                        │
│     └─ Access-Control-Allow-Headers: authorization, ...      │
│                                                              │
│  2. JWT Validation                                           │
│     └─ supabase.auth.getUser()                               │
│     └─ Return 401 if invalid                                 │
│                                                              │
│  3. Role Check (si requis)                                   │
│     └─ has_role(user.id, 'admin')                            │
│     └─ Return 403 if unauthorized                            │
│                                                              │
│  4. Business Logic                                           │
│     └─ Input validation                                      │
│     └─ Process request                                       │
│     └─ Return response                                       │
└─────────────────────────────────────────────────────────────┘
```

### Fonctions Sécurisées

| Function | Auth | Admin | Description |
|----------|------|-------|-------------|
| `get-mapbox-token` | ✅ JWT | ❌ | Retourne le token Mapbox |
| `check-subscription` | ✅ JWT | ❌ | Vérifie l'abonnement Stripe |
| `create-checkout` | ✅ JWT | ❌ | Crée une session Stripe |
| `customer-portal` | ✅ JWT | ❌ | Portail client Stripe |
| `purchase-session` | ✅ JWT | ❌ | Achat de sessions supplémentaires |
| `notifications` | ✅ JWT | ⚠️ Certaines | Envoi de notifications |
| `system` | ✅ JWT | ✅ | Stats, logs, maintenance |

### Exemple : get-mapbox-token

```typescript
serve(async (req) => {
  // 1. CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 2. JWT Validation
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Authorization required" }),
      { status: 401, headers: corsHeaders }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return new Response(
      JSON.stringify({ error: "Invalid token" }),
      { status: 401, headers: corsHeaders }
    );
  }

  // 3. Business Logic
  const token = Deno.env.get("MAPBOX_ACCESS_TOKEN");
  return new Response(
    JSON.stringify({ token }),
    { status: 200, headers: corsHeaders }
  );
});
```

---

## 🚫 Anti-Abus & Rate Limiting

### Mécanismes

| Mécanisme | Configuration | Action |
|-----------|---------------|--------|
| **Rate Limit Reports** | 5/heure | Blocage temporaire |
| **Rate Limit Reveals** | 10/heure | Blocage temporaire |
| **Shadow Ban Auto** | 3 reports/24h | Ban 24h automatique |
| **Shadow Ban Cleanup** | Cron job | Déblocage automatique |

### Implémentation Rate Limiting

```sql
-- Table de logs pour le rate limiting
CREATE TABLE public.rate_limit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'report', 'reveal', 'signal', etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fonction de vérification
CREATE FUNCTION public.check_reveal_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM reveal_logs
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN recent_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Shadow Ban Automatique

```sql
CREATE FUNCTION public.check_and_apply_shadow_ban()
RETURNS TRIGGER AS $$
DECLARE
  report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM public.reports
  WHERE reported_user_id = NEW.reported_user_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  IF report_count >= 3 THEN
    UPDATE public.profiles
    SET 
      shadow_banned = true,
      shadow_banned_until = NOW() + INTERVAL '24 hours',
      shadow_ban_reason = 'Auto: 3+ signalements en 24h'
    WHERE id = NEW.reported_user_id
      AND shadow_banned = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_check_shadow_ban
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.check_and_apply_shadow_ban();
```

---

## 📜 Conformité RGPD

### Droits des Utilisateurs

| Droit | Implémentation | Page |
|-------|----------------|------|
| **Accès** | Export JSON complet | `/data-export` |
| **Rectification** | Édition du profil | `/edit-profile` |
| **Suppression** | Suppression de compte | `/settings` |
| **Portabilité** | Export GDPR | `/data-export` |
| **Opposition** | Mode fantôme | `/privacy-settings` |

### Export GDPR

```typescript
// hooks/useGdprExport.ts
export const useGdprExport = () => {
  const exportData = async () => {
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', userId).single();
    
    const { data: signals } = await supabase
      .from('active_signals').select('*').eq('user_id', userId);
    
    const { data: sessions } = await supabase
      .from('scheduled_sessions').select('*').eq('creator_id', userId);
    
    const { data: interactions } = await supabase
      .from('interactions').select('*').or(`user_id.eq.${userId},target_user_id.eq.${userId}`);
    
    return {
      exported_at: new Date().toISOString(),
      profile,
      signals,
      sessions,
      interactions,
      // ... autres données
    };
  };
  
  return { exportData };
};
```

### Rétention des Données

| Donnée | Rétention | Nettoyage |
|--------|-----------|-----------|
| **Signaux actifs** | Jusqu'à expiration | Cron `cleanup_expired_signals()` |
| **Locations interactions** | 30 jours | Cron `cleanup_old_interaction_locations()` |
| **Rate limit logs** | 24 heures | Cron `cleanup_rate_limit_logs()` |
| **Shadow bans expirés** | Immédiat | Cron `cleanup_expired_shadow_bans()` |

---

## 📊 Audit Trail

### Événements Loggés

```sql
-- Table analytics_events
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_data JSONB,
  user_id UUID,
  page_path TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Catégories d'Événements

| Catégorie | Événements |
|-----------|------------|
| `auth` | `login`, `logout`, `signup`, `password_reset` |
| `security` | `shadow_ban_applied`, `high_reports_detected`, `rate_limit_hit` |
| `session` | `session_created`, `session_joined`, `session_completed` |
| `interaction` | `signal_started`, `signal_ended`, `reveal_profile` |
| `admin` | `user_banned`, `report_resolved`, `config_changed` |

### Logs Admin

```sql
-- Table admin_audit_logs
CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## ✅ Checklist de Sécurité

### Avant Déploiement

- [x] RLS activé sur toutes les tables
- [x] Policies RLS testées (isolation A/B/anon)
- [x] Edge functions avec JWT validation
- [x] Secrets dans Supabase Secrets (pas dans le code)
- [x] Input validation (Zod schemas)
- [x] XSS protection (sanitization)
- [x] Rate limiting actif
- [x] Email confirmation requise
- [x] Passwords forts obligatoires

### Monitoring Continu

- [x] Logs structurés (auth, errors, actions)
- [x] Page diagnostics (dev mode)
- [x] Alertes admin (high reports, errors)
- [x] Shadow ban automatique

### Tests de Sécurité

- [x] 17 tests security.test.ts
- [x] 31 tests rls-permissions.test.ts
- [x] 21 tests validation.test.ts
- [x] Edge function auth testing

---

## 🔗 Références

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [RGPD Guidelines](https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on)

---

## 📝 Historique des Versions

| Version | Date | Changements |
|---------|------|-------------|
| 1.0.0 | 28/01/2026 | Architecture initiale |
| 1.1.0 | 29/01/2026 | Ajout rate limiting + shadow ban |
| 1.2.0 | 30/01/2026 | Sécurisation edge functions |
| 1.3.0 | 30/01/2026 | Fix user_reliability RLS |

---

*Documentation générée le 30/01/2026*  
*Maintenue par l'équipe sécurité*
