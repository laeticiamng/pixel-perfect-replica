import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// TYPES
// ============================================================

type ActionType = 
  | "health" 
  | "get-stats" 
  | "get-user-quota" 
  | "get-system-logs" 
  | "get-error-rate"
  | "cleanup-expired"
  | "check-shadow-bans"
  | "send-error-alert";

interface BaseRequest {
  action: ActionType;
}

interface HealthRequest extends BaseRequest {
  action: "health";
}

interface GetStatsRequest extends BaseRequest {
  action: "get-stats";
  days_back?: number;
}

interface GetUserQuotaRequest extends BaseRequest {
  action: "get-user-quota";
  user_id: string;
}

interface GetSystemLogsRequest extends BaseRequest {
  action: "get-system-logs";
  limit?: number;
  event_category?: string;
}

interface GetErrorRateRequest extends BaseRequest {
  action: "get-error-rate";
  hours_back?: number;
}

interface CleanupExpiredRequest extends BaseRequest {
  action: "cleanup-expired";
}

interface CheckShadowBansRequest extends BaseRequest {
  action: "check-shadow-bans";
}

interface SendErrorAlertRequest extends BaseRequest {
  action: "send-error-alert";
  threshold_percent?: number;
}

type SystemRequest = 
  | HealthRequest 
  | GetStatsRequest 
  | GetUserQuotaRequest 
  | GetSystemLogsRequest 
  | GetErrorRateRequest
  | CleanupExpiredRequest
  | CheckShadowBansRequest
  | SendErrorAlertRequest;

// deno-lint-ignore no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

interface AuthResult {
  authenticated: boolean;
  userId?: string;
  isAdmin?: boolean;
  error?: string;
}

async function validateAuth(
  req: Request,
  supabase: AnySupabaseClient,
  requireAdmin: boolean = false
): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader) {
    return { authenticated: false, error: "Missing Authorization header" };
  }

  const token = authHeader.replace("Bearer ", "");
  
  if (!token || token === authHeader) {
    return { authenticated: false, error: "Invalid Authorization header format" };
  }

  try {
    // Create a client with the user's token to get their identity
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    
    if (userError || !user) {
      console.error("[system/auth] Token validation failed:", userError);
      return { authenticated: false, error: "Invalid or expired token" };
    }

    let isAdmin = false;
    
    if (requireAdmin) {
      // Check if user has admin role using service role client
      const { data: hasRole } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      isAdmin = hasRole === true;
      
      if (!isAdmin) {
        return { authenticated: true, userId: user.id, isAdmin: false, error: "Admin role required" };
      }
    }

    return { authenticated: true, userId: user.id, isAdmin };
  } catch (error) {
    console.error("[system/auth] Error validating token:", error);
    return { authenticated: false, error: "Token validation failed" };
  }
}

// ============================================================
// HANDLERS
// ============================================================

function handleHealth(): Response {
  return new Response(
    JSON.stringify({
      success: true,
      action: "health",
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.2.0",
      actions: [
        "health",
        "get-stats",
        "get-user-quota",
        "get-system-logs",
        "get-error-rate",
        "cleanup-expired",
        "check-shadow-bans",
        "send-error-alert"
      ],
      auth_required: {
        "health": "none",
        "get-stats": "admin",
        "get-user-quota": "authenticated",
        "get-system-logs": "admin",
        "get-error-rate": "admin",
        "cleanup-expired": "admin",
        "check-shadow-bans": "admin",
        "send-error-alert": "admin"
      }
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetStats(
  payload: GetStatsRequest,
  supabase: AnySupabaseClient
): Promise<Response> {
  const daysBack = payload.days_back ?? 7;

  console.log(`[system/get-stats] Fetching stats for last ${daysBack} days`);

  // Get daily active users
  const { data: dauData, error: dauError } = await supabase.rpc('get_daily_active_users', {
    days_back: daysBack
  });

  if (dauError) {
    console.error("[system/get-stats] Error fetching DAU:", dauError);
  }

  // Get total users count
  const { count: totalUsers, error: usersError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (usersError) {
    console.error("[system/get-stats] Error fetching users count:", usersError);
  }

  // Get active signals count
  const { count: activeSignals, error: signalsError } = await supabase
    .from("active_signals")
    .select("*", { count: "exact", head: true })
    .gt("expires_at", new Date().toISOString());

  if (signalsError) {
    console.error("[system/get-stats] Error fetching signals count:", signalsError);
  }

  // Get total interactions
  const { count: totalInteractions, error: interactionsError } = await supabase
    .from("interactions")
    .select("*", { count: "exact", head: true });

  if (interactionsError) {
    console.error("[system/get-stats] Error fetching interactions count:", interactionsError);
  }

  // Get active events count
  const { count: activeEvents, error: eventsError } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .gt("ends_at", new Date().toISOString());

  if (eventsError) {
    console.error("[system/get-stats] Error fetching events count:", eventsError);
  }

  // Get reports count (last 24h)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: reportsLast24h, error: reportsError } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .gt("created_at", yesterday);

  if (reportsError) {
    console.error("[system/get-stats] Error fetching reports count:", reportsError);
  }

  return new Response(
    JSON.stringify({
      success: true,
      action: "get-stats",
      data: {
        total_users: totalUsers ?? 0,
        active_signals: activeSignals ?? 0,
        total_interactions: totalInteractions ?? 0,
        active_events: activeEvents ?? 0,
        reports_last_24h: reportsLast24h ?? 0,
        daily_active_users: dauData ?? [],
        timestamp: new Date().toISOString(),
      },
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetUserQuota(
  payload: GetUserQuotaRequest,
  supabase: AnySupabaseClient,
  requestingUserId: string
): Promise<Response> {
  const { user_id } = payload;

  if (!user_id) {
    return new Response(
      JSON.stringify({ error: "Missing required field: user_id" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Users can only query their own quota (admins can query anyone via admin endpoints)
  if (user_id !== requestingUserId) {
    return new Response(
      JSON.stringify({ error: "Cannot query another user's quota" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log(`[system/get-user-quota] Fetching quota for user: ${user_id}`);

  // Get user stats
  const { data: stats, error: statsError } = await supabase
    .from("user_stats")
    .select("interactions, hours_active, rating, total_ratings")
    .eq("user_id", user_id)
    .single();

  if (statsError) {
    console.error("[system/get-user-quota] Error fetching user stats:", statsError);
    return new Response(
      JSON.stringify({ error: "User not found or stats unavailable" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get user's reports count (how many times they've been reported)
  const { count: reportCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("reported_user_id", user_id);

  // Get user's active signal
  const { data: activeSignal } = await supabase
    .from("active_signals")
    .select("id, activity, expires_at")
    .eq("user_id", user_id)
    .gt("expires_at", new Date().toISOString())
    .single();

  // Define quotas (can be made configurable)
  const quotas = {
    max_interactions_per_day: 50,
    max_signals_per_day: 10,
    max_reports_before_review: 3,
  };

  return new Response(
    JSON.stringify({
      success: true,
      action: "get-user-quota",
      data: {
        user_id,
        stats: stats ?? { interactions: 0, hours_active: 0, rating: 5, total_ratings: 0 },
        report_count: reportCount ?? 0,
        has_active_signal: !!activeSignal,
        active_signal: activeSignal,
        quotas,
        timestamp: new Date().toISOString(),
      },
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetSystemLogs(
  payload: GetSystemLogsRequest,
  supabase: AnySupabaseClient
): Promise<Response> {
  const limit = Math.min(payload.limit ?? 50, 200);
  const eventCategory = payload.event_category;

  console.log(`[system/get-system-logs] Fetching last ${limit} logs`);

  let query = supabase
    .from("analytics_events")
    .select("id, event_name, event_category, event_data, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (eventCategory) {
    query = query.eq("event_category", eventCategory);
  }

  const { data: logs, error } = await query;

  if (error) {
    console.error("[system/get-system-logs] Error fetching logs:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch logs" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get unique categories for filtering
  const { data: categories } = await supabase
    .from("analytics_events")
    .select("event_category")
    .limit(100);

  const uniqueCategories = [...new Set((categories ?? []).map((c: { event_category: string }) => c.event_category))];

  return new Response(
    JSON.stringify({
      success: true,
      action: "get-system-logs",
      data: {
        logs: logs ?? [],
        count: logs?.length ?? 0,
        available_categories: uniqueCategories,
        timestamp: new Date().toISOString(),
      },
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetErrorRate(
  payload: GetErrorRateRequest,
  supabase: AnySupabaseClient
): Promise<Response> {
  const hoursBack = payload.hours_back ?? 24;
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

  console.log(`[system/get-error-rate] Checking error rate for last ${hoursBack} hours`);

  // Count error events
  const { count: errorCount, error: errorErr } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("event_category", "error")
    .gt("created_at", since);

  if (errorErr) {
    console.error("[system/get-error-rate] Error fetching error count:", errorErr);
  }

  // Count total events
  const { count: totalCount, error: totalErr } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .gt("created_at", since);

  if (totalErr) {
    console.error("[system/get-error-rate] Error fetching total count:", totalErr);
  }

  const errors = errorCount ?? 0;
  const total = totalCount ?? 1;
  const errorRate = total > 0 ? (errors / total) * 100 : 0;

  // Determine health status
  let healthStatus: "healthy" | "warning" | "critical";
  if (errorRate < 1) {
    healthStatus = "healthy";
  } else if (errorRate < 5) {
    healthStatus = "warning";
  } else {
    healthStatus = "critical";
  }

  return new Response(
    JSON.stringify({
      success: true,
      action: "get-error-rate",
      data: {
        error_count: errors,
        total_events: total,
        error_rate_percent: Math.round(errorRate * 100) / 100,
        health_status: healthStatus,
        period_hours: hoursBack,
        since,
        timestamp: new Date().toISOString(),
      },
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleCleanupExpired(
  supabase: AnySupabaseClient
): Promise<Response> {
  console.log("[system/cleanup-expired] Running cleanup tasks");

  const results: Record<string, { deleted: number; error?: string }> = {};

  // Cleanup expired signals
  try {
    const { error } = await supabase.rpc('cleanup_expired_signals');
    if (error) {
      results.signals = { deleted: 0, error: error.message };
    } else {
      // Count remaining (for logging)
      const { count } = await supabase
        .from("active_signals")
        .select("*", { count: "exact", head: true })
        .lt("expires_at", new Date().toISOString());
      results.signals = { deleted: count ?? 0 };
    }
  } catch (err) {
    results.signals = { deleted: 0, error: String(err) };
  }

  // Cleanup old interaction locations (privacy)
  try {
    const { error } = await supabase.rpc('cleanup_old_interaction_locations');
    if (error) {
      results.interaction_locations = { deleted: 0, error: error.message };
    } else {
      results.interaction_locations = { deleted: 0 }; // Function doesn't return count
    }
  } catch (err) {
    results.interaction_locations = { deleted: 0, error: String(err) };
  }

  // Cleanup rate limit logs
  try {
    const { error } = await supabase.rpc('cleanup_rate_limit_logs');
    if (error) {
      results.rate_limit_logs = { deleted: 0, error: error.message };
    } else {
      results.rate_limit_logs = { deleted: 0 };
    }
  } catch (err) {
    results.rate_limit_logs = { deleted: 0, error: String(err) };
  }

  // Cleanup old reveal logs (GDPR - 90 days retention)
  try {
    const { error } = await supabase.rpc('cleanup_old_reveal_logs');
    if (error) {
      results.reveal_logs = { deleted: 0, error: error.message };
    } else {
      results.reveal_logs = { deleted: 0 }; // Function doesn't return count
    }
  } catch (err) {
    results.reveal_logs = { deleted: 0, error: String(err) };
  }

  console.log("[system/cleanup-expired] Cleanup completed:", results);

  return new Response(
    JSON.stringify({
      success: true,
      action: "cleanup-expired",
      data: {
        results,
        timestamp: new Date().toISOString(),
      },
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleCheckShadowBans(
  supabase: AnySupabaseClient
): Promise<Response> {
  console.log("[system/check-shadow-bans] Running shadow-ban cleanup");

  // Clean up expired shadow-bans
  const { error } = await supabase.rpc('cleanup_expired_shadow_bans');

  if (error) {
    console.error("[system/check-shadow-bans] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get count of currently shadow-banned users
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("shadow_banned", true);

  return new Response(
    JSON.stringify({
      success: true,
      action: "check-shadow-bans",
      data: {
        shadow_banned_count: count ?? 0,
        cleanup_completed: true,
        timestamp: new Date().toISOString(),
      },
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleSendErrorAlert(
  payload: SendErrorAlertRequest,
  supabase: AnySupabaseClient
): Promise<Response> {
  const thresholdPercent = payload.threshold_percent ?? 5;
  const hoursBack = 1; // Check last hour

  console.log(`[system/send-error-alert] Checking if error rate > ${thresholdPercent}%`);

  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

  // Count error events
  const { count: errorCount } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("event_category", "error")
    .gt("created_at", since);

  // Count total events
  const { count: totalCount } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .gt("created_at", since);

  const errors = errorCount ?? 0;
  const total = totalCount ?? 1;
  const errorRate = total > 0 ? (errors / total) * 100 : 0;

  // Check if alert is needed
  const shouldAlert = errorRate >= thresholdPercent;

  if (shouldAlert) {
    // Get admin emails with alert_error_spike enabled
    const { data: admins } = await supabase
      .from("admin_alert_preferences")
      .select("email, user_id")
      .eq("alert_error_spike", true);

    // Log the alert
    if (admins && admins.length > 0) {
      for (const admin of admins) {
        await supabase.from("alert_logs").insert({
          alert_type: "error_spike",
          subject: `⚠️ Error rate spike: ${errorRate.toFixed(2)}%`,
          recipient_email: admin.email,
          metadata: {
            error_rate: errorRate,
            error_count: errors,
            total_events: total,
            threshold: thresholdPercent,
            period_hours: hoursBack,
          },
        });
      }

      console.log(`[system/send-error-alert] Alert sent to ${admins.length} admins`);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      action: "send-error-alert",
      data: {
        error_rate_percent: Math.round(errorRate * 100) / 100,
        threshold_percent: thresholdPercent,
        alert_triggered: shouldAlert,
        admins_notified: shouldAlert ? (await supabase.from("admin_alert_preferences").select("email").eq("alert_error_spike", true)).data?.length ?? 0 : 0,
        timestamp: new Date().toISOString(),
      },
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ============================================================
// MAIN ROUTER
// ============================================================

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json() as SystemRequest;
    const { action } = body;

    if (!action) {
      return new Response(
        JSON.stringify({
          error: "Missing 'action' field",
          availableActions: [
            "health",
            "get-stats",
            "get-user-quota",
            "get-system-logs",
            "get-error-rate",
            "cleanup-expired",
            "check-shadow-bans",
            "send-error-alert"
          ],
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[system] Routing action: ${action}`);

    let response: Response;

    switch (action) {
      case "health":
        // Health check doesn't require auth
        response = handleHealth();
        break;

      case "get-stats": {
        // Requires admin role
        const authResult = await validateAuth(req, supabase, true);
        if (!authResult.authenticated) {
          return new Response(
            JSON.stringify({ error: authResult.error || "Unauthorized" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!authResult.isAdmin) {
          return new Response(
            JSON.stringify({ error: "Admin role required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        response = await handleGetStats(body as GetStatsRequest, supabase);
        break;
      }

      case "get-user-quota": {
        // Requires authentication
        const authResult = await validateAuth(req, supabase, false);
        if (!authResult.authenticated || !authResult.userId) {
          return new Response(
            JSON.stringify({ error: authResult.error || "Unauthorized" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        response = await handleGetUserQuota(body as GetUserQuotaRequest, supabase, authResult.userId);
        break;
      }

      case "get-system-logs": {
        // Requires admin role
        const authResult = await validateAuth(req, supabase, true);
        if (!authResult.authenticated) {
          return new Response(
            JSON.stringify({ error: authResult.error || "Unauthorized" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!authResult.isAdmin) {
          return new Response(
            JSON.stringify({ error: "Admin role required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        response = await handleGetSystemLogs(body as GetSystemLogsRequest, supabase);
        break;
      }

      case "get-error-rate": {
        // Requires admin role
        const authResult = await validateAuth(req, supabase, true);
        if (!authResult.authenticated) {
          return new Response(
            JSON.stringify({ error: authResult.error || "Unauthorized" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!authResult.isAdmin) {
          return new Response(
            JSON.stringify({ error: "Admin role required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        response = await handleGetErrorRate(body as GetErrorRateRequest, supabase);
        break;
      }

      case "cleanup-expired": {
        // Requires admin role
        const authResult = await validateAuth(req, supabase, true);
        if (!authResult.authenticated) {
          return new Response(
            JSON.stringify({ error: authResult.error || "Unauthorized" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!authResult.isAdmin) {
          return new Response(
            JSON.stringify({ error: "Admin role required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        response = await handleCleanupExpired(supabase);
        break;
      }

      case "check-shadow-bans": {
        // Requires admin role
        const authResult = await validateAuth(req, supabase, true);
        if (!authResult.authenticated) {
          return new Response(
            JSON.stringify({ error: authResult.error || "Unauthorized" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!authResult.isAdmin) {
          return new Response(
            JSON.stringify({ error: "Admin role required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        response = await handleCheckShadowBans(supabase);
        break;
      }

      case "send-error-alert": {
        // Requires admin role
        const authResult = await validateAuth(req, supabase, true);
        if (!authResult.authenticated) {
          return new Response(
            JSON.stringify({ error: authResult.error || "Unauthorized" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!authResult.isAdmin) {
          return new Response(
            JSON.stringify({ error: "Admin role required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        response = await handleSendErrorAlert(body as SendErrorAlertRequest, supabase);
        break;
      }

      default:
        response = new Response(
          JSON.stringify({
            error: `Unknown action: ${action}`,
            availableActions: [
              "health",
              "get-stats",
              "get-user-quota",
              "get-system-logs",
              "get-error-rate",
              "cleanup-expired",
              "check-shadow-bans",
              "send-error-alert"
            ],
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const duration = Date.now() - startTime;
    console.log(`[system] Action '${action}' completed in ${duration}ms`);

    return response;
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    console.error(`[system] Error after ${duration}ms:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
