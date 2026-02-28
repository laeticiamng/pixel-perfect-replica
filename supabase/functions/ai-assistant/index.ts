import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface IcebreakerRequest {
  activity: string;
  context?: {
    time_of_day?: string;
    location_type?: string;
    user_interests?: string[];
    other_user_name?: string;
  };
  language?: string;
}

interface SessionRecommendationRequest {
  user_id: string;
  preferences?: {
    favorite_activities?: string[];
    preferred_times?: string[];
    city?: string;
  };
  history?: {
    past_activities?: string[];
    successful_sessions?: number;
  };
}

// Rate limit configuration
const RATE_LIMIT_CONFIG: Record<string, { max_requests: number; window_seconds: number }> = {
  icebreaker: { max_requests: 20, window_seconds: 60 }, // 20 requests per minute
  'session-recommendations': { max_requests: 10, window_seconds: 60 }, // 10 requests per minute
};

// In-memory rate limiting (simple fallback, resets on function restart)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

function checkInMemoryRateLimit(
  userId: string,
  action: string
): { allowed: boolean; retryAfter?: number } {
  const config = RATE_LIMIT_CONFIG[action] || { max_requests: 10, window_seconds: 60 };
  const key = `${userId}:ai-assistant-${action}`;
  const now = Date.now();
  
  const entry = rateLimitCache.get(key);
  
  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitCache.set(key, { count: 1, resetTime: now + config.window_seconds * 1000 });
    return { allowed: true };
  }
  
  if (entry.count >= config.max_requests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  entry.count++;
  return { allowed: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'icebreaker';
    const body = await req.json();

    console.log(`[ai-assistant] Action: ${action}`, JSON.stringify(body, null, 2));

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (!claimsError && claimsData?.claims?.sub) {
        userId = claimsData.claims.sub as string;
      }
    }

    // Apply rate limiting if user is authenticated
    if (userId) {
      const rateLimitResult = checkInMemoryRateLimit(userId, action);
      
      if (!rateLimitResult.allowed) {
        console.log(`[ai-assistant] Rate limit exceeded for user ${userId}, action: ${action}`);
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          retry_after: rateLimitResult.retryAfter 
        }), {
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter || 60)
          },
        });
      }
    }

    if (action === 'icebreaker') {
      return await handleIcebreaker(body as IcebreakerRequest, LOVABLE_API_KEY);
    } else if (action === 'session-recommendations') {
      return await handleSessionRecommendations(body as SessionRecommendationRequest, LOVABLE_API_KEY);
    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("[ai-assistant] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleIcebreaker(
  request: IcebreakerRequest, 
  apiKey: string
): Promise<Response> {
  const { activity, context, language = 'fr' } = request;

  const activityLabels: Record<string, string> = {
    studying: 'étudier/réviser',
    eating: 'manger/déjeuner',
    working: 'travailler',
    talking: 'discuter/papoter',
    sport: 'faire du sport',
    other: 'une activité',
  };

  const activityLabel = activityLabels[activity] || activity;
  const timeContext = context?.time_of_day || 'journée';
  const userName = context?.other_user_name || 'cette personne';

  const systemPrompt = `Tu es un assistant social expert qui aide les étudiants à briser la glace lors de rencontres spontanées. 
Tu génères des phrases d'accroche naturelles, amicales et contextualisées.

Règles:
- Sois naturel et décontracté, comme si tu parlais à un ami
- Évite les phrases clichées ou trop formelles
- Adapte le ton au contexte (étude = calme, sport = énergique, manger = convivial)
- Maximum 2 phrases courtes
- Utilise des emojis avec parcimonie (1-2 max)
- La langue est: ${language === 'fr' ? 'français' : 'English'}`;

  const userPrompt = `Génère 3 phrases d'accroche différentes pour quelqu'un qui veut ${activityLabel} avec ${userName}.
Contexte: C'est ${timeContext}.
${context?.location_type ? `Lieu: ${context.location_type}` : ''}
${context?.user_interests?.length ? `Intérêts communs possibles: ${context.user_interests.join(', ')}` : ''}

Réponds uniquement avec un JSON array de 3 strings, rien d'autre.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[ai-assistant] AI Gateway error:", response.status, errorText);
    
    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Fallback to static icebreakers
    return new Response(JSON.stringify({
      icebreakers: getStaticIcebreakers(activity),
      source: 'fallback'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const aiResponse = await response.json();
  const content = aiResponse.choices?.[0]?.message?.content || '';

  try {
    // Try to parse JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const icebreakers = JSON.parse(jsonMatch[0]);
      console.log("[ai-assistant] Generated icebreakers:", icebreakers);
      return new Response(JSON.stringify({ icebreakers, source: 'ai' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (parseError) {
    console.error("[ai-assistant] Parse error:", parseError);
  }

  // Fallback
  return new Response(JSON.stringify({
    icebreakers: getStaticIcebreakers(activity),
    source: 'fallback'
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleSessionRecommendations(
  request: SessionRecommendationRequest,
  apiKey: string
): Promise<Response> {
  const { preferences, history } = request;

  const systemPrompt = `Tu es un assistant qui recommande des sessions de binôme (rencontres planifiées entre étudiants) basées sur leurs préférences et leur historique.

Tu dois retourner des recommandations personnalisées incluant:
- Le type d'activité recommandé
- Le meilleur moment de la journée
- Des conseils pour rendre la session réussie
- Un message d'encouragement

Réponds en JSON avec cette structure:
{
  "recommendations": [
    {
      "activity": "studying|eating|working|talking|sport|other",
      "reason": "Pourquoi cette activité",
      "best_time": "Matin|Midi|Après-midi|Soir",
      "tip": "Un conseil pratique"
    }
  ],
  "motivation": "Message d'encouragement personnalisé"
}`;

  const userPrompt = `Profil utilisateur:
- Activités préférées: ${preferences?.favorite_activities?.join(', ') || 'Non spécifiées'}
- Horaires préférés: ${preferences?.preferred_times?.join(', ') || 'Flexibles'}
- Ville: ${preferences?.city || 'Non spécifiée'}
- Sessions réussies: ${history?.successful_sessions || 0}
- Activités passées: ${history?.past_activities?.slice(0, 5).join(', ') || 'Aucune'}

Génère 3 recommandations personnalisées.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    console.error("[ai-assistant] Session recommendations error:", response.status);
    return new Response(JSON.stringify({ 
      error: "Failed to generate recommendations" 
    }), {
      status: response.status === 429 ? 429 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const aiResponse = await response.json();
  const content = aiResponse.choices?.[0]?.message?.content || '';

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(recommendations), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (parseError) {
    console.error("[ai-assistant] Parse error:", parseError);
  }

  return new Response(JSON.stringify({
    recommendations: [
      { activity: "studying", reason: "Populaire entre étudiants", best_time: "Après-midi", tip: "Choisis un endroit calme" },
      { activity: "eating", reason: "Parfait pour briser la glace", best_time: "Midi", tip: "Propose un lieu accessible" },
    ],
    motivation: "Chaque session est une opportunité de rencontre !"
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getStaticIcebreakers(activity: string): string[] {
  const icebreakers: Record<string, string[]> = {
    studying: [
      "Hey ! Tu révises quoi en ce moment ? 📚",
      "Besoin d'un partenaire de révision ? Je suis là !",
      "On se motive ensemble pour bosser ?",
    ],
    eating: [
      "T'as faim ? Je connais un bon spot ! 🍽️",
      "On partage un repas ? C'est toujours mieux à deux",
      "Je cherche quelqu'un pour déjeuner, ça te dit ?",
    ],
    working: [
      "Tu bosses sur quoi ? Je suis curieux ! 💻",
      "Envie de co-worker ? On se motive !",
      "Je cherche de la compagnie pour travailler",
    ],
    talking: [
      "Hey ! Une pause café ça te dit ? ☕",
      "Je m'ennuie, on papote ?",
      "T'as 5 minutes pour discuter ?",
    ],
    sport: [
      "Prêt·e pour une session ? 🏃",
      "On se motive pour bouger !",
      "Envie de faire du sport ensemble ?",
    ],
    other: [
      "Salut ! Qu'est-ce que tu fais de beau ?",
      "Hey, on fait connaissance ?",
      "Envie de passer un moment sympa ?",
    ],
  };

  return icebreakers[activity] || icebreakers.other;
}
