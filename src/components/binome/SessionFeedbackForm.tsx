import { useState } from 'react';
import { Star, Check, ThumbsUp, Clock, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface Participant { id: string; name: string; }

interface SessionFeedbackFormProps {
  sessionId: string;
  participants: Participant[];
  onComplete: () => void;
}

interface FeedbackData { punctual: boolean; pleasant: boolean; would_recommend: boolean; comment: string; }

export function SessionFeedbackForm({ sessionId, participants, onComplete }: SessionFeedbackFormProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackData>>(
    Object.fromEntries(participants.map(p => [p.id, { punctual: true, pleasant: true, would_recommend: true, comment: '' }]))
  );

  const currentParticipant = participants[currentIndex];
  const currentFeedback = feedbacks[currentParticipant?.id] || { punctual: true, pleasant: true, would_recommend: true, comment: '' };

  const updateFeedback = (field: keyof FeedbackData, value: boolean | string) => {
    setFeedbacks(prev => ({ ...prev, [currentParticipant.id]: { ...prev[currentParticipant.id], [field]: value } }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const feedbackInserts = participants.map(participant => ({
        session_id: sessionId, from_user_id: user.id, to_user_id: participant.id,
        punctual: feedbacks[participant.id].punctual, pleasant: feedbacks[participant.id].pleasant,
        would_recommend: feedbacks[participant.id].would_recommend, comment: feedbacks[participant.id].comment || null
      }));

      const { error } = await supabase.from('session_feedback').insert(feedbackInserts);
      if (error) throw error;

      for (const participant of participants) {
        const feedback = feedbacks[participant.id];
        const positiveCount = [feedback.punctual, feedback.pleasant, feedback.would_recommend].filter(Boolean).length;
        await supabase.rpc('update_reliability_from_feedback', { p_user_id: participant.id, p_positive: positiveCount >= 2 });
      }

      toast.success(t('sessionFeedback.thanksFeedback'));
      onComplete();
    } catch (error) {
      logger.api.error('session_feedback', 'submit', String(error));
      toast.error(t('sessionFeedback.feedbackError'));
    } finally { setIsSubmitting(false); }
  };

  const handleNext = () => { if (currentIndex < participants.length - 1) { setCurrentIndex(currentIndex + 1); } else { handleSubmit(); } };
  const handlePrevious = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };

  if (participants.length === 0) return null;

  return (
    <Card className="glass border-2 border-coral/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-signal-yellow fill-signal-yellow" />
          {t('sessionFeedback.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('sessionFeedback.participantOf').replace('{current}', String(currentIndex + 1)).replace('{total}', String(participants.length))}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
          <Avatar className="h-12 w-12 border-2 border-coral/30">
            <AvatarFallback className="bg-coral/20 text-coral">{currentParticipant.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{currentParticipant.name}</p>
            <p className="text-sm text-muted-foreground">{t('sessionFeedback.rateThisPerson')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-3">
              <Clock className={cn("h-5 w-5", currentFeedback.punctual ? "text-signal-green" : "text-muted-foreground")} />
              <Label htmlFor="punctual" className="text-foreground cursor-pointer">{t('sessionFeedback.wasOnTime')}</Label>
            </div>
            <Switch id="punctual" checked={currentFeedback.punctual} onCheckedChange={(checked) => updateFeedback('punctual', checked)} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-3">
              <Heart className={cn("h-5 w-5", currentFeedback.pleasant ? "text-coral" : "text-muted-foreground")} />
              <Label htmlFor="pleasant" className="text-foreground cursor-pointer">{t('sessionFeedback.pleasantCompany')}</Label>
            </div>
            <Switch id="pleasant" checked={currentFeedback.pleasant} onCheckedChange={(checked) => updateFeedback('pleasant', checked)} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-3">
              <ThumbsUp className={cn("h-5 w-5", currentFeedback.would_recommend ? "text-signal-yellow" : "text-muted-foreground")} />
              <Label htmlFor="recommend" className="text-foreground cursor-pointer">{t('sessionFeedback.iRecommend')}</Label>
            </div>
            <Switch id="recommend" checked={currentFeedback.would_recommend} onCheckedChange={(checked) => updateFeedback('would_recommend', checked)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">{t('sessionFeedback.commentOptional')}</Label>
          <Textarea value={currentFeedback.comment} onChange={(e) => updateFeedback('comment', e.target.value)} placeholder={t('sessionFeedback.commentPlaceholder')} className="bg-muted/30 border-border rounded-xl resize-none" maxLength={200} />
          <p className="text-xs text-muted-foreground text-right">{currentFeedback.comment.length}/200</p>
        </div>

        <div className="flex justify-center gap-2">
          {participants.map((_, index) => (
            <div key={index} className={cn("w-2 h-2 rounded-full transition-colors", index === currentIndex ? "bg-coral" : index < currentIndex ? "bg-signal-green" : "bg-muted")} />
          ))}
        </div>

        <div className="flex gap-3">
          {currentIndex > 0 && <Button variant="outline" onClick={handlePrevious} className="flex-1">{t('sessionFeedback.previous')}</Button>}
          <Button onClick={handleNext} disabled={isSubmitting} className="flex-1 bg-coral hover:bg-coral/90">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : currentIndex === participants.length - 1 ? <><Check className="h-4 w-4 mr-2" />{t('sessionFeedback.finish')}</> : t('next')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}