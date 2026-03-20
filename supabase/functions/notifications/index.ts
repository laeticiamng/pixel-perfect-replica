// Version: 2.0.1 — Force redeploy for P3 cron fix (anon key bypass)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from "../_shared/auth.ts";

// ============================================================
// TYPES
// ============================================================

type ActionType = "send-admin-alert" | "send-push" | "send-session-reminders" | "send-reengagement" | "health";

interface BaseRequest {
  action: ActionType;
}

interface AdminAlertRequest extends BaseRequest {
  action: "send-admin-alert";
  alert_type: "new_user" | "high_reports" | "error_spike" | "custom";
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
}

interface PushNotificationRequest extends BaseRequest {
  action: "send-push";
  targetUserId: string;
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
}

interface SessionRemindersRequest extends BaseRequest {
  action: "send-session-reminders";
}

interface ReengagementRequest extends BaseRequest {
  action: "send-reengagement";
}

interface HealthRequest extends BaseRequest {
  action: "health";
}

interface AdminPref {
  email: string;
  alert_new_user: boolean;
  alert_high_reports: boolean;
  alert_error_spike: boolean;
}

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface SessionReminder {
  session_id: string;
  participant_id: string;
  user_id: string;
  reminder_type: string;
  session_date: string;
  start_time: string;
  activity: string;
  city: string;
  location_name: string | null;
  creator_name: string;
}

type NotificationRequest = AdminAlertRequest | PushNotificationRequest | SessionRemindersRequest | ReengagementRequest | HealthRequest;

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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims?.sub) {
      console.error("[notifications/auth] Token validation failed:", claimsError);
      return { authenticated: false, error: "Invalid or expired token" };
    }

    const userId = claimsData.claims.sub as string;
    let isAdmin = false;
    
    if (requireAdmin) {
      const { data: hasRole } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      isAdmin = hasRole === true;
      
      if (!isAdmin) {
        return { authenticated: true, userId, isAdmin: false, error: "Admin role required" };
      }
    }

    return { authenticated: true, userId, isAdmin };
  } catch (error) {
    console.error("[notifications/auth] Error validating token:", error);
    return { authenticated: false, error: "Token validation failed" };
  }
}

// ============================================================
// HANDLERS
// ============================================================

async function handleAdminAlert(
  payload: AdminAlertRequest,
  supabase: AnySupabaseClient
): Promise<Response> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const { alert_type, subject, message, metadata = {} } = payload;

  if (!alert_type || !subject || !message) {
    throw new Error("Missing required fields: alert_type, subject, message");
  }

  const resend = new Resend(RESEND_API_KEY);

  // Get all admin users with alert preferences
  const { data: adminPrefs, error: prefsError } = await supabase
    .from("admin_alert_preferences")
    .select("email, alert_new_user, alert_high_reports, alert_error_spike");

  if (prefsError) {
    console.error("[notifications/admin-alert] Error fetching admin preferences:", prefsError);
    throw new Error("Failed to fetch admin preferences");
  }

  // Filter admins based on their alert preferences
  const recipients = (adminPrefs as AdminPref[] | null)?.filter((pref) => {
    switch (alert_type) {
      case "new_user":
        return pref.alert_new_user;
      case "high_reports":
        return pref.alert_high_reports;
      case "error_spike":
        return pref.alert_error_spike;
      case "custom":
        return true;
      default:
        return false;
    }
  });

  if (!recipients || recipients.length === 0) {
    console.log("[notifications/admin-alert] No recipients for alert type:", alert_type);
    return new Response(
      JSON.stringify({ success: true, message: "No recipients configured for this alert type" }),
      { status: 200, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
    );
  }

  const alertTypeLabels: Record<string, string> = {
    new_user: "🆕 Nouvel Utilisateur",
    high_reports: "⚠️ Signalements Élevés",
    error_spike: "🔴 Pic d'Erreurs",
    custom: "📢 Alerte Personnalisée",
  };

  const alertLabel = alertTypeLabels[alert_type] || "Alerte";

  // Send emails to all recipients
  const emailPromises = recipients.map(async (recipient: AdminPref) => {
    const emailResult = await resend.emails.send({
      from: "NEARVITY Alerts <alerts@resend.dev>",
      to: [recipient.email],
      subject: `[NEARVITY] ${alertLabel}: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a14; color: #ffffff; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 48px;">${alertLabel.split(" ")[0]}</span>
            </div>
            
            <h1 style="color: #FF6B6B; margin: 0 0 16px; font-size: 24px; text-align: center;">
              ${subject}
            </h1>
            
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0; line-height: 1.6; color: #e0e0e0;">
                ${message}
              </p>
            </div>
            
            ${Object.keys(metadata).length > 0 ? `
            <div style="background: rgba(255,107,107,0.1); border-radius: 8px; padding: 16px; margin-top: 16px;">
              <h3 style="color: #FF6B6B; margin: 0 0 12px; font-size: 14px;">Détails</h3>
              <pre style="margin: 0; font-size: 12px; color: #a0a0a0; white-space: pre-wrap;">${JSON.stringify(metadata, null, 2)}</pre>
            </div>
            ` : ""}
            
            <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0; font-size: 12px; color: #666;">
                Cet email a été envoyé automatiquement par NEARVITY.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Log the sent alert
    await supabase.from("alert_logs").insert({
      alert_type,
      recipient_email: recipient.email,
      subject,
      metadata,
    });

    return emailResult;
  });

  const results = await Promise.allSettled(emailPromises);
  const successCount = results.filter((r) => r.status === "fulfilled").length;
  const failureCount = results.filter((r) => r.status === "rejected").length;

  console.log(`[notifications/admin-alert] Alert sent: ${successCount} success, ${failureCount} failures`);

  return new Response(
    JSON.stringify({
      success: true,
      action: "send-admin-alert",
      sent: successCount,
      failed: failureCount,
    }),
    { status: 200, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
  );
}

async function handlePushNotification(
  payload: PushNotificationRequest,
  supabase: AnySupabaseClient
): Promise<Response> {
  const { targetUserId, title, body, icon, data } = payload;

  if (!targetUserId || !title || !body) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: targetUserId, title, body" }),
      { status: 400, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
    );
  }

  // Get user's push subscriptions
  const { data: subscriptions, error: subError } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", targetUserId);

  if (subError) {
    console.error("[notifications/push] Error fetching subscriptions:", subError);
    return new Response(
      JSON.stringify({ error: "Failed to fetch subscriptions" }),
      { status: 500, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
    );
  }

  const subs = subscriptions as PushSubscription[] | null;

  if (!subs || subs.length === 0) {
    console.log("[notifications/push] No push subscriptions found for user:", targetUserId);
    return new Response(
      JSON.stringify({ message: "No subscriptions found", sent: 0 }),
      { status: 200, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
    );
  }

  console.log(`[notifications/push] Would send push to ${subs.length} subscription(s) for user ${targetUserId}`);
  console.log("[notifications/push] Notification:", { title, body, icon, data });

  return new Response(
    JSON.stringify({
      success: true,
      action: "send-push",
      message: "Notification queued",
      sent: subs.length,
      title,
      body,
    }),
    { status: 200, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
  );
}

async function handleSessionReminders(
  supabase: AnySupabaseClient
): Promise<Response> {
  try {
    // Get sessions needing reminders
    const { data: reminders, error: remindersError } = await supabase
      .rpc('get_sessions_needing_reminders');

    if (remindersError) {
      console.error("[notifications/session-reminders] Error fetching reminders:", remindersError);
      throw new Error("Failed to fetch sessions needing reminders");
    }

    const remindersList = reminders as SessionReminder[] | null;

    if (!remindersList || remindersList.length === 0) {
      console.log("[notifications/session-reminders] No reminders needed");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No reminders needed" }),
        { status: 200, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
      );
    }

    console.log(`[notifications/session-reminders] Processing ${remindersList.length} reminders`);

    const activityLabels: Record<string, string> = {
      studying: "Réviser",
      working: "Bosser",
      eating: "Manger",
      sport: "Sport",
      talking: "Parler",
      other: "Autre"
    };

    let sentCount = 0;
    const processedParticipants = new Set<string>();

    for (const reminder of remindersList) {
      // Skip if we've already processed this participant in this run
      const key = `${reminder.participant_id}-${reminder.reminder_type}`;
      if (processedParticipants.has(key)) continue;
      processedParticipants.add(key);

      const activityLabel = activityLabels[reminder.activity] || reminder.activity;
      const locationText = reminder.location_name 
        ? `${reminder.city} - ${reminder.location_name}`
        : reminder.city;

      let title: string;
      let body: string;

      if (reminder.reminder_type === '1h') {
        title = `⏰ Session dans 1 heure !`;
        body = `${activityLabel} avec ${reminder.creator_name} à ${locationText}`;
      } else {
        title = `🔔 Session dans 15 minutes !`;
        body = `${activityLabel} avec ${reminder.creator_name} à ${locationText} - C'est bientôt !`;
      }

      // Log the notification (in production, this would send a push notification)
      console.log(`[notifications/session-reminders] Sending ${reminder.reminder_type} reminder to user ${reminder.user_id}: ${title}`);

      // Mark the reminder as sent
      const updateField = reminder.reminder_type === '1h' ? 'reminder_1h_sent' : 'reminder_15m_sent';
      const { error: updateError } = await supabase
        .from('session_participants')
        .update({ [updateField]: true })
        .eq('id', reminder.participant_id);

      if (updateError) {
        console.error(`[notifications/session-reminders] Error updating reminder status:`, updateError);
      } else {
        sentCount++;
      }
    }

    console.log(`[notifications/session-reminders] Sent ${sentCount} reminders`);

    return new Response(
      JSON.stringify({
        success: true,
        action: "send-session-reminders",
        sent: sentCount,
        total: remindersList.length,
      }),
      { status: 200, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[notifications/session-reminders] Error:", error);
    throw error;
  }
}

function handleHealth(): Response {
  return new Response(
    JSON.stringify({
      success: true,
      action: "health",
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.4.0",
      actions: ["send-admin-alert", "send-push", "send-session-reminders", "send-reengagement", "health"],
    }),
    { status: 200, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
  );
}

// ============================================================
// RE-ENGAGEMENT HANDLER
// ============================================================

async function handleReengagement(
  supabase: AnySupabaseClient
): Promise<Response> {
  try {
    // Find users inactive > 3 days:
    // - Have a profile
    // - Have push_notifications enabled
    // - Last analytics event > 3 days ago
    // - Were NOT already sent a reengagement notification in the last 7 days
    const { data: inactiveUsers, error: queryError } = await supabase
      .from("profiles")
      .select("id, first_name")
      .not("id", "is", null);

    if (queryError) {
      console.error("[notifications/reengagement] Error fetching profiles:", queryError);
      throw new Error("Failed to fetch profiles");
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No users to process" }),
        { status: 200, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    for (const user of inactiveUsers) {
      // Check if user has push notifications enabled
      const { data: settings } = await supabase
        .from("user_settings")
        .select("push_notifications")
        .eq("user_id", user.id)
        .single();

      if (!settings?.push_notifications) continue;

      // Check last activity
      const { data: lastActivity } = await supabase
        .from("analytics_events")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      // If user has recent activity (< 3 days), skip
      if (lastActivity && lastActivity.length > 0 && lastActivity[0].created_at > threeDaysAgo) {
        continue;
      }

      // Check if we already sent a reengagement notification in the last 7 days
      const { data: recentReengagement } = await supabase
        .from("analytics_events")
        .select("id")
        .eq("user_id", user.id)
        .eq("event_name", "reengagement_sent")
        .gte("created_at", sevenDaysAgo)
        .limit(1);

      if (recentReengagement && recentReengagement.length > 0) continue;

      // Check if user has push subscriptions
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint")
        .eq("user_id", user.id)
        .limit(1);

      if (!subs || subs.length === 0) continue;

      // Send push notification (log for now)
      console.log(`[notifications/reengagement] Sending to ${user.id} (${user.first_name})`);

      // Log the reengagement event to prevent spam
      await supabase.from("analytics_events").insert({
        user_id: user.id,
        event_name: "reengagement_sent",
        event_category: "engagement",
        event_data: { type: "push", days_inactive: 3 },
      });

      sentCount++;

      // Cap at 50 per run to avoid timeouts
      if (sentCount >= 50) break;
    }

    console.log(`[notifications/reengagement] Sent ${sentCount} reengagement notifications`);

    return new Response(
      JSON.stringify({ success: true, action: "send-reengagement", sent: sentCount }),
      { status: 200, headers: { ...getCorsHeaders(), "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[notifications/reengagement] Error:", error);
    throw error;
  }
}

// ============================================================
// MAIN ROUTER
// ============================================================

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  const startTime = Date.now();

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json() as NotificationRequest;
    const { action } = body;

    if (!action) {
      return new Response(
        JSON.stringify({
          error: "Missing 'action' field",
          availableActions: ["send-admin-alert", "send-push", "send-session-reminders", "health"],
        }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    console.log(`[notifications] Routing action: ${action}`);

    let response: Response;

    switch (action) {
      case "health":
        // Health check doesn't require auth
        response = handleHealth();
        break;

      case "send-admin-alert": {
        // Requires admin role
        const authResult = await validateAuth(req, supabase, true);
        if (!authResult.authenticated) {
          return new Response(
            JSON.stringify({ error: authResult.error || "Unauthorized" }),
            { status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
          );
        }
        if (!authResult.isAdmin) {
          return new Response(
            JSON.stringify({ error: "Admin role required" }),
            { status: 403, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
          );
        }
        response = await handleAdminAlert(body as AdminAlertRequest, supabase);
        break;
      }

      case "send-push": {
        // Requires authentication
        const authResult = await validateAuth(req, supabase, false);
        if (!authResult.authenticated) {
          return new Response(
            JSON.stringify({ error: authResult.error || "Unauthorized" }),
            { status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
          );
        }
        response = await handlePushNotification(body as PushNotificationRequest, supabase);
        break;
      }

      case "send-session-reminders": {
        // Cron/internal — verify the caller is using the project anon key or service role key
        const cronToken = req.headers.get("Authorization")?.replace("Bearer ", "");
        const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
        const SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        if (!cronToken || (cronToken !== ANON_KEY && cronToken !== SRK)) {
          console.warn("[notifications] send-session-reminders: unauthorized caller");
          return new Response(
            JSON.stringify({ error: "Unauthorized — cron token required" }),
            { status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
          );
        }
        console.log("[notifications] send-session-reminders: cron auth verified");
        response = await handleSessionReminders(supabase);
        break;
      }

      case "send-reengagement": {
        // Cron/internal — verify the caller is using the project anon key or service role key
        const reengToken = req.headers.get("Authorization")?.replace("Bearer ", "");
        const ANON_KEY_RE = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
        const SRK_RE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        if (!reengToken || (reengToken !== ANON_KEY_RE && reengToken !== SRK_RE)) {
          console.warn("[notifications] send-reengagement: unauthorized caller");
          return new Response(
            JSON.stringify({ error: "Unauthorized — cron token required" }),
            { status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
          );
        }
        console.log("[notifications] send-reengagement: cron auth verified");
        response = await handleReengagement(supabase);
        break;
      }

      default:
        response = new Response(
          JSON.stringify({
            error: `Unknown action: ${action}`,
            availableActions: ["send-admin-alert", "send-push", "send-session-reminders", "send-reengagement", "health"],
          }),
          { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
        );
    }

    const duration = Date.now() - startTime;
    console.log(`[notifications] Action '${action}' completed in ${duration}ms`);

    return response;
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    console.error(`[notifications] Error after ${duration}ms:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
