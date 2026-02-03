import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VoiceIcebreakerResponse {
  success: boolean;
  audio_base64: string;
  content_type: string;
  text_length: number;
  error?: string;
}

export function useVoiceIcebreaker() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateVoice = useCallback(async (text: string, voiceId?: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<VoiceIcebreakerResponse>(
        'voice-icebreaker',
        {
          body: { text, voice_id: voiceId },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to generate voice');
      }

      return data.audio_base64;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('[useVoiceIcebreaker] Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const playIcebreaker = useCallback(async (text: string, voiceId?: string): Promise<void> => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audioBase64 = await generateVoice(text, voiceId);
    if (!audioBase64) return;

    try {
      // Convert base64 to audio and play
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setError('Erreur de lecture audio');
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.error('[useVoiceIcebreaker] Playback error:', err);
      setError('Impossible de lire l\'audio');
    }
  }, [generateVoice]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  return {
    generateVoice,
    playIcebreaker,
    stopPlayback,
    isLoading,
    isPlaying,
    error,
  };
}
