import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppFeedback } from '@/hooks/useAppFeedback';
import { sanitizeDbText } from '@/lib/sanitize';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { submitFeedback, isLoading } = useAppFeedback();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Choisis une note d\'abord !');
      return;
    }
    
    // Sanitize feedback text
    const sanitizedFeedback = sanitizeDbText(feedback, 500);
    
    const { error } = await submitFeedback(rating, sanitizedFeedback || undefined);
    
    if (error) {
      toast.error('Erreur lors de l\'envoi');
      return;
    }
    
    toast.success('Merci pour ton feedback ! 🙏');
    navigate('/profile');
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-radial pb-8 safe-bottom">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Donner un feedback</h1>
      </header>

      <div className="px-6 py-8 animate-slide-up">
        <div className="text-center mb-8">
          <p className="text-lg text-foreground mb-2 font-semibold">Comment trouves-tu SIGNAL ?</p>
          <p className="text-sm text-muted-foreground">Ton avis nous aide à améliorer l'app</p>
        </div>

        {/* Star Rating with enhanced styling */}
        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-2 transition-all duration-300 hover:scale-125 active:scale-95"
            >
              <Star
                className={cn(
                  'h-10 w-10 transition-all duration-300',
                  star <= rating
                    ? 'text-signal-yellow fill-signal-yellow drop-shadow-[0_0_12px_hsl(var(--signal-yellow)/0.6)]'
                    : 'text-muted-foreground/50 hover:text-muted-foreground'
                )}
              />
            </button>
          ))}
        </div>

        {/* Feedback Text */}
        <div className="space-y-3 mb-8">
          <label className="text-sm font-semibold text-foreground">
            Un commentaire ? (optionnel)
          </label>
          <Textarea
            placeholder="Dis-nous ce que tu penses de l'app, ce qui te plaît ou ce qu'on pourrait améliorer..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[120px] bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-2xl resize-none shadow-soft focus:ring-2 focus:ring-coral/30"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {feedback.length}/500
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || rating === 0}
          className="w-full h-14 bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-primary-foreground rounded-2xl text-lg font-bold glow-coral shadow-medium disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Envoyer mon feedback'
          )}
        </Button>
      </div>
    </div>
  );
}
