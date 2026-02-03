import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Rate limit configuration: 5 voice generations per minute per user
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60;

// In-memory rate limiting
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

function checkInMemoryRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const key = `voice-icebreaker:${userId}`;
  const now = Date.now();
  
  const entry = rateLimitCache.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitCache.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_SECONDS * 1000 });
    return { allowed: true };
  }
  
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
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
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!userError && userData?.user) {
        userId = userData.user.id;
      }
    }

    // Require authentication for voice generation (expensive API)
    if (!userId) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Authentication required for voice generation'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Apply rate limiting
    const rateLimitResult = checkInMemoryRateLimit(userId);
    
    if (!rateLimitResult.allowed) {
      console.log(`[voice-icebreaker] Rate limit exceeded for user ${userId}`);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Rate limit exceeded. Maximum 5 voice generations per minute.',
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

    const { text, voice_id } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Limit text length to prevent abuse
    if (text.length > 500) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Text too long. Maximum 500 characters.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[voice-icebreaker] Generating audio for:', text.slice(0, 50), `(user: ${userId})`);

    // Use ElevenLabs TTS API
    // Default to a friendly French voice
    const selectedVoiceId = voice_id || 'EXAVITQu4vr4xnSDxMaL'; // Sarah - friendly female voice

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[voice-icebreaker] ElevenLabs error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid ElevenLabs API key');
      }
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'ElevenLabs rate limit exceeded' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get audio as array buffer
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log('[voice-icebreaker] Generated audio, size:', audioBuffer.byteLength);

    return new Response(JSON.stringify({
      success: true,
      audio_base64: base64Audio,
      content_type: 'audio/mpeg',
      text_length: text.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[voice-icebreaker] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
