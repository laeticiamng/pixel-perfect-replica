import { authenticateRequest, isAuthError, requireAdmin, corsHeaders } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/ratelimit.ts";
import { z, validateBody, isValidationError } from "../_shared/validation.ts";

const scrapeSchema = z.object({
  url: z.string().min(1).max(2000),
  options: z.object({
    formats: z.array(z.string().max(50)).max(5).optional(),
    onlyMainContent: z.boolean().optional(),
    waitFor: z.number().int().min(0).max(30000).optional(),
    location: z.object({
      country: z.string().max(10).optional(),
      languages: z.array(z.string().max(10)).max(5).optional(),
    }).optional(),
  }).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = await authenticateRequest(req);
    if (isAuthError(auth)) return auth;

    const adminCheck = await requireAdmin(auth.userId);
    if (adminCheck !== true) return adminCheck;

    // Rate limit: 10 scrape requests per minute
    const rl = checkRateLimit(`firecrawl-scrape:${auth.userId}`, { maxRequests: 10, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const rawBody = await req.json();
    const parsed = validateBody(rawBody, scrapeSchema);
    if (isValidationError(parsed)) return parsed;

    const { url, options } = parsed;

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl connector not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Scraping URL:", formattedUrl);

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: options?.formats || ["markdown"],
        onlyMainContent: options?.onlyMainContent ?? true,
        waitFor: options?.waitFor,
        location: options?.location,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Firecrawl API error:", data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Scrape successful");
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error scraping:", error);
    const msg = error instanceof Error ? error.message : "Failed to scrape";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
