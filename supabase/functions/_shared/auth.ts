import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Allowed origins for CORS — restrict to production domain + Lovable preview
const ALLOWED_ORIGINS = [
  "https://nearvity.fr",
  "https://www.nearvity.fr",
];

function getAllowedOrigin(req?: Request): string {
  const origin = req?.headers?.get("Origin") ?? "";
  // Allow production domains, lovable previews, and localhost for dev
  if (
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith(".lovable.app") ||
    origin.endsWith(".lovableproject.com") ||
    origin.endsWith(".lovable.dev") ||
    origin.startsWith("http://localhost")
  ) {
    return origin;
  }
  // Default to production domain (safe fallback)
  return ALLOWED_ORIGINS[0];
}

export function getCorsHeaders(req?: Request) {
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(req),
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Vary": "Origin",
  };
}

/**
 * @deprecated Use getCorsHeaders(req) for origin-aware CORS.
 * This wildcard fallback is only kept as a re-export of getCorsHeaders()
 * so that any remaining callers still compile. It resolves to the
 * production domain when no request is available.
 */
export const corsHeaders = getCorsHeaders();

export interface AuthResult {
  userId: string;
  email: string;
  claims: Record<string, unknown>;
}

export function errorResponse(status: number, message: string, req?: Request): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
  );
}

/**
 * Centralized auth helper for Edge Functions (Tickets 2+3).
 *
 * - Extracts and validates the JWT via getClaims()
 * - Checks mandatory claims (sub, exp)
 * - Verifies token expiration as a compensating control for verify_jwt=false
 * - Logs failures safely (first 8 chars of token only)
 * - Returns a uniform 401 Response on failure
 */
export async function authenticateRequest(
  req: Request
): Promise<AuthResult | Response> {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    console.warn("[auth] Missing or malformed Authorization header");
    return errorResponse(401, "Missing authorization header", req);
  }

  const token = authHeader.replace("Bearer ", "");
  const tokenPrefix = token.substring(0, 8);

  if (!token || token.length < 10) {
    console.warn(`[auth] Token too short (prefix: ${tokenPrefix}…)`);
    return errorResponse(401, "Invalid authentication token", req);
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: claimsData, error: claimsError } =
    await supabaseClient.auth.getClaims(token);

  if (claimsError || !claimsData?.claims?.sub) {
    console.warn(
      `[auth] getClaims failed (prefix: ${tokenPrefix}…): ${claimsError?.message ?? "no sub claim"}`
    );
    return errorResponse(401, "Invalid or expired authentication token", req);
  }

  const claims = claimsData.claims as Record<string, unknown>;

  // Compensating control: explicit expiration check
  if (typeof claims.exp === "number") {
    const nowSec = Math.floor(Date.now() / 1000);
    if (claims.exp < nowSec) {
      console.warn(
        `[auth] Token expired (prefix: ${tokenPrefix}…), exp=${claims.exp} now=${nowSec}`
      );
      return errorResponse(401, "Authentication token has expired", req);
    }
  }

  return {
    userId: claims.sub as string,
    email: (claims.email as string) || "",
    claims,
  };
}

/** Type guard – true when authenticateRequest returned an error Response */
export function isAuthError(
  result: AuthResult | Response
): result is Response {
  return result instanceof Response;
}

/**
 * Verify the authenticated user holds the admin role.
 * Returns `true` on success or a 403 Response on failure.
 */
export async function requireAdmin(
  userId: string
): Promise<true | Response> {
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const { data: isAdmin, error } = await serviceClient.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });

  if (error || !isAdmin) {
    console.warn(`[auth] Admin check failed for ${userId}`);
    return errorResponse(403, "Admin access required");
  }

  return true;
}
