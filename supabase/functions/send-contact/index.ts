import { getCorsHeaders, authenticateRequest, isAuthError } from "../_shared/auth.ts";

const SUPPORT_EMAIL = "contact@emotionscare.com";

/**
 * Edge Function: send-contact
 * Sends a contact form message via Resend API.
 * Requires authentication to prevent spam.
 */
function serve(handler: (req: Request) => Promise<Response>) {
  // @ts-expect-error Deno global is provided in the Supabase Edge runtime
  Deno.serve(handler);
}

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Authenticate the request
  const authResult = await authenticateRequest(req);
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await req.json();
    const { name, email, message } = body;

    // Validate inputs
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid name" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (!email || typeof email !== "string" || !email.includes("@") || email.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (!message || typeof message !== "string" || message.trim().length < 10 || message.length > 2000) {
      return new Response(JSON.stringify({ error: "Message must be between 10 and 2000 characters" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[send-contact] RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 503,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NEARVITY Contact <noreply@nearvity.fr>",
        to: [SUPPORT_EMAIL],
        reply_to: email.trim(),
        subject: `[NEARVITY Contact] Message from ${name.trim()}`,
        text: [
          `Name: ${name.trim()}`,
          `Email: ${email.trim()}`,
          `User ID: ${authResult.userId}`,
          "",
          message.trim(),
        ].join("\n"),
      }),
    });

    if (!resendResponse.ok) {
      const errBody = await resendResponse.text();
      console.error(`[send-contact] Resend API error: ${resendResponse.status} ${errBody}`);
      return new Response(JSON.stringify({ error: "Failed to send message" }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[send-contact] Unexpected:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
