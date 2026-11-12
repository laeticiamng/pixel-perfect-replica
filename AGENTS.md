# AGENTS

- Never call `supabase.auth.refreshSession()` in components/hooks; use `getSession()`. Why: forced token rotation can sign users out.
