import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.2";
import { authenticateRequest, isAuthError, requireAdmin, corsHeaders } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/ratelimit.ts";
import { z, validateBody, isValidationError } from "../_shared/validation.ts";

interface FirecrawlResponse {
  success: boolean;
  data?: {
    content?: string;
    markdown?: string;
    links?: string[];
    metadata?: { title?: string; description?: string };
  }[];
  error?: string;
}

const scrapeEventsSchema = z.object({
  university_url: z.string().url().max(2000),
  city: z.string().min(1).max(100),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const auth = await authenticateRequest(req);
    if (isAuthError(auth)) return auth;

    const adminCheck = await requireAdmin(auth.userId);
    if (adminCheck !== true) return adminCheck;

    console.log("[scrape-events] Authenticated admin:", auth.userId);

    // Rate limit: 5 scrape requests per minute
    const rl = checkRateLimit(`scrape-events:${auth.userId}`, { maxRequests: 5, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY is not configured");

    const rawBody = await req.json();
    const parsed = validateBody(rawBody, scrapeEventsSchema);
    if (isValidationError(parsed)) return parsed;

    const { university_url, city } = parsed;

    console.log("[scrape-events] Scraping events from:", university_url);

    const firecrawlResponse = await fetch("https://api.firecrawl.dev/v1/crawl", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: university_url,
        limit: 10,
        scrapeOptions: {
          formats: ["markdown", "links"],
          includeTags: ["article", "section", ".event", ".events", '[class*="event"]'],
        },
      }),
    });

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      console.error("[scrape-events] Firecrawl error:", firecrawlResponse.status, errorText);
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
    }

    const crawlResult = await firecrawlResponse.json();
    console.log("[scrape-events] Crawl initiated:", crawlResult.id);

    let scrapeData: FirecrawlResponse | null = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const statusResponse = await fetch(`https://api.firecrawl.dev/v1/crawl/${crawlResult.id}`, {
        headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}` },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.status === "completed") {
          scrapeData = statusData;
          break;
        } else if (statusData.status === "failed") {
          throw new Error("Firecrawl job failed");
        }
      }
      attempts++;
    }

    if (!scrapeData || !scrapeData.data) {
      throw new Error("Failed to get scrape results");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const combinedContent = scrapeData.data
      .map((d) => d.markdown || d.content || "")
      .join("\n\n")
      .slice(0, 15000);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Tu es un assistant qui extrait les événements étudiants à partir de contenu web scrapé.
Extrais les événements et retourne un JSON array avec les champs:
- name: nom de l'événement
- description: description courte
- location_name: lieu (si mentionné)
- starts_at: date/heure de début au format ISO 8601 (si mentionné)
- ends_at: date/heure de fin au format ISO 8601 (si mentionné)

Retourne UNIQUEMENT le JSON array, sans markdown ni explication.
Si aucun événement n'est trouvé, retourne [].`,
          },
          {
            role: "user",
            content: `Extrait les événements étudiants de ce contenu:\n\n${combinedContent}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[scrape-events] AI error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const eventsText = aiResult.choices?.[0]?.message?.content || "[]";

    let events;
    try {
      const cleanedText = eventsText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      events = JSON.parse(cleanedText);
    } catch {
      console.error("[scrape-events] Failed to parse events JSON:", eventsText);
      events = [];
    }

    console.log("[scrape-events] Extracted events:", events.length);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serviceSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const importedEvents = [];
    for (const event of events) {
      if (!event.name) continue;

      const latitude = 48.8566 + (Math.random() - 0.5) * 0.05;
      const longitude = 2.3522 + (Math.random() - 0.5) * 0.05;

      const { data, error } = await serviceSupabase
        .from("events")
        .insert({
          name: event.name,
          description: event.description || null,
          location_name: event.location_name || city,
          latitude,
          longitude,
          starts_at: event.starts_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          ends_at: event.ends_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          organizer_id: auth.userId,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("[scrape-events] Failed to insert event:", error);
      } else if (data) {
        importedEvents.push(data);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        scraped_pages: scrapeData.data.length,
        events_found: events.length,
        events_imported: importedEvents.length,
        events: importedEvents,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[scrape-events] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
