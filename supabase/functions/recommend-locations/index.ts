import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, isAuthError, corsHeaders } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/ratelimit.ts";
import { z, validateBody, isValidationError } from "../_shared/validation.ts";

interface LocationRecommendation {
  name: string;
  address: string;
  type: string;
  rating?: number;
  description: string;
  tips: string[];
  best_for: string[];
}

const recommendSchema = z.object({
  activity: z.string().min(1).max(50),
  city: z.string().min(1).max(100),
  context: z.string().max(500).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const auth = await authenticateRequest(req);
    if (isAuthError(auth)) return auth;

    console.log("[recommend-locations] Authenticated user:", auth.userId);

    // Rate limit: 10 requests per minute
    const rl = checkRateLimit(`recommend-locations:${auth.userId}`, { maxRequests: 10, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY is not configured");

    const rawBody = await req.json();
    const parsed = validateBody(rawBody, recommendSchema);
    if (isValidationError(parsed)) return parsed;

    const { activity, city, context } = parsed;

    console.log("[recommend-locations] Getting recommendations for:", activity, "in", city);

    const activityPrompts: Record<string, string> = {
      studying: "meilleurs endroits calmes pour étudier, bibliothèques, cafés avec wifi",
      eating: "meilleurs restaurants, cafés, bistrots pour déjeuner entre amis",
      working: "espaces de coworking, cafés avec prises électriques, lieux calmes pour travailler",
      talking: "cafés sympas, terrasses, bars à vin pour discuter",
      sport: "salles de sport, parcs pour courir, terrains de sport",
      other: "lieux populaires pour rencontrer des gens",
    };

    const activityDesc = activityPrompts[activity] || activityPrompts.other;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: `Tu es un expert local qui recommande des lieux pour des activités sociales.
Retourne EXACTEMENT un JSON array avec 3-5 recommandations.
Chaque objet doit avoir: name, address, type, description (courte), tips (array de 2 conseils), best_for (array de 2 tags).
Retourne UNIQUEMENT le JSON, pas de markdown.`,
          },
          {
            role: "user",
            content: `Recommande les meilleurs endroits à ${city} pour: ${activityDesc}${context ? `. Contexte additionnel: ${context}` : ""}. Retourne uniquement le JSON array.`,
          },
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("[recommend-locations] Perplexity error:", response.status, errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "[]";
    const citations = result.citations || [];

    let recommendations: LocationRecommendation[];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      recommendations = JSON.parse(cleaned);
    } catch {
      console.error("[recommend-locations] Failed to parse JSON:", content);
      recommendations = [
        {
          name: "Café Central",
          address: `Centre-ville, ${city}`,
          type: "café",
          description: "Un café populaire parfait pour rencontrer des gens",
          tips: ["Arriver tôt le weekend", "Bon wifi gratuit"],
          best_for: [activity, "networking"],
        },
      ];
    }

    console.log("[recommend-locations] Found recommendations:", recommendations.length);

    return new Response(
      JSON.stringify({ success: true, activity, city, recommendations, citations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[recommend-locations] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
