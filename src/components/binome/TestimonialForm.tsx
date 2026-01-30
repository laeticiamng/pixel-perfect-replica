import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface TestimonialFormProps {
  sessionId: string;
  activity: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TestimonialForm({ sessionId, activity, onSuccess, onCancel }: TestimonialFormProps) {
  const { user } = useAuth();
  const [quote, setQuote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !quote.trim()) {
      toast.error('Écris un témoignage avant de soumettre');
      return;
    }

    if (quote.length < 20) {
      toast.error('Ton témoignage doit faire au moins 20 caractères');
      return;
    }

    if (quote.length > 500) {
      toast.error('Ton témoignage ne peut pas dépasser 500 caractères');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('user_testimonials')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          quote: quote.trim(),
          activity
        });

      if (error) {
        console.error('Error submitting testimonial:', error);
        if (error.code === '23505') {
          toast.error('Tu as déjà soumis un témoignage pour cette session');
        } else {
          toast.error('Erreur lors de la soumission');
        }
        return;
      }

      toast.success('Merci pour ton témoignage ! 🎉');
      onSuccess?.();
    } catch (err) {
      console.error('Error:', err);
      toast.error('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-coral/5 to-signal-green/5 border-coral/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Quote className="h-5 w-5 text-coral" />
            Partage ton expérience !
          </CardTitle>
          <CardDescription>
            Ton témoignage aidera d'autres personnes à découvrir EASY
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="Raconte comment s'est passée ta rencontre... (20-500 caractères)"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="min-h-[100px] resize-none bg-background/50"
                maxLength={500}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {quote.length}/500 caractères
                </span>
                {quote.length > 0 && quote.length < 20 && (
                  <span className="text-xs text-destructive">
                    Minimum 20 caractères
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
              <Star className="h-4 w-4 text-coral shrink-0" />
              <span>
                Ton prénom et l'activité ({activity}) seront affichés avec ton témoignage après validation.
              </span>
            </div>

            <div className="flex gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Plus tard
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || quote.length < 20}
                className="flex-1 bg-coral hover:bg-coral/90 gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Envoi...' : 'Envoyer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
