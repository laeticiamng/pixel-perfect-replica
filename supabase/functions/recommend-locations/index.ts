import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://nearvity.fr',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface LocationRecommendation {
  name: string;
  address: string;
  type: string;
  rating?: number;
  description: string;
  tips: string[];
  best_for: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Require authentication to prevent abuse
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[recommend-locations] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate JWT using getUser
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !userData?.user) {
      console.log('[recommend-locations] JWT validation failed:', authError?.message || 'No user');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log('[recommend-locations] Authenticated user:', userData.user.id);

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not configured');
    }

    const { activity, city, context } = await req.json();

    if (!activity || !city) {
      return new Response(JSON.stringify({ error: 'activity and city are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[recommend-locations] Getting recommendations for:', activity, 'in', city);

    const activityPrompts: Record<string, string> = {
      studying: `meilleurs endroits calmes pour étudier, bibliothèques, cafés avec wifi`,
      eating: `meilleurs restaurants, cafés, bistrots pour déjeuner entre amis`,
      working: `espaces de coworking, cafés avec prises électriques, lieux calmes pour travailler`,
      talking: `cafés sympas, terrasses, bars à vin pour discuter`,
      sport: `salles de sport, parcs pour courir, terrains de sport`,
      other: `lieux populaires pour rencontrer des gens`,
    };

    const activityDesc = activityPrompts[activity] || activityPrompts.other;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert local qui recommande des lieux pour des activités sociales.
Retourne EXACTEMENT un JSON array avec 3-5 recommandations.
Chaque objet doit avoir: name, address, type, description (courte), tips (array de 2 conseils), best_for (array de 2 tags).
Retourne UNIQUEMENT le JSON, pas de markdown.`,
          },
          {
            role: 'user',
            content: `Recommande les meilleurs endroits à ${city} pour: ${activityDesc}${context ? `. Contexte additionnel: ${context}` : ''}. Retourne uniquement le JSON array.`,
          },
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('[recommend-locations] Perplexity error:', response.status, errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '[]';
    const citations = result.citations || [];

    let recommendations: LocationRecommendation[];
    try {
      // Clean the response
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleanedContent);
    } catch (e) {
      console.error('[recommend-locations] Failed to parse JSON:', content);
      // Fallback recommendations
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

    console.log('[recommend-locations] Found recommendations:', recommendations.length);

    return new Response(JSON.stringify({
      success: true,
      activity,
      city,
      recommendations,
      citations,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[recommend-locations] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
