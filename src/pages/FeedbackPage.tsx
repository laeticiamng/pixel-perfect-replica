import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppFeedback } from '@/hooks/useAppFeedback';
import { useRateLimit, RATE_LIMIT_PRESETS } from '@/hooks/useRateLimit';
import { sanitizeDbText } from '@/lib/sanitize';
import { useTranslation } from '@/lib/i18n';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/shared';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function FeedbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { submitFeedback, isLoading } = useAppFeedback();
  const feedbackRateLimit = useRateLimit(RATE_LIMIT_PRESETS.feedback);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t('feedback.ratingRequired'));
      return;
    }
    
    const { allowed } = feedbackRateLimit.checkRateLimit();
    if (!allowed) {
      toast.error(t('auth.tooManyAttempts'));
      return;
    }
    
    const sanitizedFeedback = sanitizeDbText(feedback, 500);
    
    feedbackRateLimit.recordAttempt();
    const { error } = await submitFeedback(rating, sanitizedFeedback || undefined);
    
    if (error) {
      toast.error(t('feedback.sendError'));
      return;
    }
    
    toast.success(t('feedback.success'));
    navigate('/profile');
  };

  return (
    <PageLayout className="pb-8 safe-bottom">
      <PageHeader title={t('feedback.title')} backTo="/profile" />

      <div className="px-6 py-8 animate-slide-up">
        <div className="text-center mb-8">
          <p className="text-lg text-foreground mb-2 font-semibold">{t('feedback.question')}</p>
          <p className="text-sm text-muted-foreground">{t('feedback.subtitle')}</p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              aria-label={t('feedback.starLabel').replace('{star}', String(star))}
              aria-pressed={star <= rating}
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
            {t('feedback.commentLabel')}
          </label>
          <Textarea
            placeholder={t('feedback.placeholder')}
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
            t('feedback.submit')
          )}
        </Button>
      </div>
    </PageLayout>
  );
}
