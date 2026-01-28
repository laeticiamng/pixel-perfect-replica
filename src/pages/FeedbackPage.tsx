import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppFeedback } from '@/hooks/useAppFeedback';
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
    
    const { error } = await submitFeedback(rating, feedback || undefined);
    
    if (error) {
      toast.error('Erreur lors de l\'envoi');
      return;
    }
    
    toast.success('Merci pour ton feedback ! 🙏');
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gradient-radial pb-8">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Donner un feedback</h1>
      </header>

      <div className="px-6 py-8">
        <div className="text-center mb-8">
          <p className="text-lg text-foreground mb-2">Comment trouves-tu SIGNAL ?</p>
          <p className="text-sm text-muted-foreground">Ton avis nous aide à améliorer l'app</p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-2 transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={`h-10 w-10 transition-colors ${
                  star <= rating
                    ? 'text-signal-yellow fill-signal-yellow'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Feedback Text */}
        <div className="space-y-2 mb-8">
          <label className="text-sm font-medium text-foreground">
            Un commentaire ? (optionnel)
          </label>
          <Textarea
            placeholder="Dis-nous ce que tu penses de l'app, ce qui te plaît ou ce qu'on pourrait améliorer..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[120px] bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl resize-none"
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
          className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold glow-coral"
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
