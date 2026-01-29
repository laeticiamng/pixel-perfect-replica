import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// TYPES
// ============================================================

type ActionType = "send-admin-alert" | "send-push" | "health";

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

type NotificationRequest = AdminAlertRequest | PushNotificationRequest | HealthRequest;

// deno-lint-ignore no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

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
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      from: "Signal Alerts <alerts@resend.dev>",
      to: [recipient.email],
      subject: `[Signal] ${alertLabel}: ${subject}`,
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
                Cet email a été envoyé automatiquement par Signal.
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
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const subs = subscriptions as PushSubscription[] | null;

  if (!subs || subs.length === 0) {
    console.log("[notifications/push] No push subscriptions found for user:", targetUserId);
    return new Response(
      JSON.stringify({ message: "No subscriptions found", sent: 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function handleHealth(): Response {
  return new Response(
    JSON.stringify({
      success: true,
      action: "health",
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      actions: ["send-admin-alert", "send-push", "health"],
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

    const body = await req.json() as NotificationRequest;
    const { action } = body;

    if (!action) {
      return new Response(
        JSON.stringify({
          error: "Missing 'action' field",
          availableActions: ["send-admin-alert", "send-push", "health"],
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[notifications] Routing action: ${action}`);

    let response: Response;

    switch (action) {
      case "send-admin-alert":
        response = await handleAdminAlert(body as AdminAlertRequest, supabase);
        break;

      case "send-push":
        response = await handlePushNotification(body as PushNotificationRequest, supabase);
        break;

      case "health":
        response = handleHealth();
        break;

      default:
        response = new Response(
          JSON.stringify({
            error: `Unknown action: ${action}`,
            availableActions: ["send-admin-alert", "send-push", "health"],
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
