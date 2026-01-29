import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AlertRequest {
  alert_type: "new_user" | "high_reports" | "error_spike" | "custom";
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const resend = new Resend(RESEND_API_KEY);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { alert_type, subject, message, metadata = {} }: AlertRequest = await req.json();

    if (!alert_type || !subject || !message) {
      throw new Error("Missing required fields: alert_type, subject, message");
    }

    // Get all admin users with alert preferences
    const { data: adminPrefs, error: prefsError } = await supabase
      .from("admin_alert_preferences")
      .select("email, alert_new_user, alert_high_reports, alert_error_spike");

    if (prefsError) {
      console.error("Error fetching admin preferences:", prefsError);
      throw new Error("Failed to fetch admin preferences");
    }

    // Filter admins based on their alert preferences
    const recipients = adminPrefs?.filter((pref) => {
      switch (alert_type) {
        case "new_user":
          return pref.alert_new_user;
        case "high_reports":
          return pref.alert_high_reports;
        case "error_spike":
          return pref.alert_error_spike;
        case "custom":
          return true; // Custom alerts go to all admins
        default:
          return false;
      }
    });

    if (!recipients || recipients.length === 0) {
      console.log("No recipients for alert type:", alert_type);
      return new Response(
        JSON.stringify({ success: true, message: "No recipients configured for this alert type" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get alert type label
    const alertTypeLabels: Record<string, string> = {
      new_user: "🆕 Nouvel Utilisateur",
      high_reports: "⚠️ Signalements Élevés",
      error_spike: "🔴 Pic d'Erreurs",
      custom: "📢 Alerte Personnalisée",
    };

    const alertLabel = alertTypeLabels[alert_type] || "Alerte";

    // Send emails to all recipients
    const emailPromises = recipients.map(async (recipient) => {
      const emailResult = await resend.emails.send({
        from: "Signal Alerts <alerts@resend.dev>", // Replace with your verified domain
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

    console.log(`Alert sent: ${successCount} success, ${failureCount} failures`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failureCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-admin-alert:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
