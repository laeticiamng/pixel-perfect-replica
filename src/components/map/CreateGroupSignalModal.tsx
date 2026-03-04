import { useState } from 'react';
import { X, Users, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ActivitySelector } from '@/components/radar/ActivitySelector';
import { LocationDescriptionInput } from '@/components/radar/LocationDescriptionInput';
import { useTranslation } from '@/lib/i18n';
import { ActivityType } from '@/types/signal';

interface CreateGroupSignalModalProps {
  onClose: () => void;
  onSubmit: (data: {
    activity: ActivityType;
    title: string;
    description?: string;
    maxParticipants: number;
    locationDescription?: string;
  }) => void;
  isLoading?: boolean;
}

export function CreateGroupSignalModal({ onClose, onSubmit, isLoading }: CreateGroupSignalModalProps) {
  const { t } = useTranslation();
  const [activity, setActivity] = useState<ActivityType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(5);
  const [locationDescription, setLocationDescription] = useState('');

  const handleSubmit = () => {
    if (!activity || !title.trim()) return;
    onSubmit({
      activity,
      title: title.trim(),
      description: description.trim() || undefined,
      maxParticipants,
      locationDescription: locationDescription.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[500px] glass-strong rounded-t-3xl p-6 pb-8 animate-slide-up max-h-[85dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('groupSignal.createTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('groupSignal.createSubtitle')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Title */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium text-foreground">{t('groupSignal.titleLabel')}</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('groupSignal.titlePlaceholder')}
            className="h-12 rounded-xl"
            maxLength={60}
          />
        </div>

        {/* Activity */}
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground mb-2 block">{t('groupSignal.activityLabel')}</label>
          <ActivitySelector selectedActivity={activity} onSelect={setActivity} />
        </div>

        {/* Max participants */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium text-foreground">{t('groupSignal.maxParticipants')}</label>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={() => setMaxParticipants(Math.max(3, maxParticipants - 1))}
              disabled={maxParticipants <= 3}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-coral" />
              <span className="text-2xl font-bold text-foreground w-8 text-center">{maxParticipants}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={() => setMaxParticipants(Math.min(20, maxParticipants + 1))}
              disabled={maxParticipants >= 20}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium text-foreground">{t('groupSignal.descriptionLabel')}</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('groupSignal.descriptionPlaceholder')}
            className="rounded-xl resize-none"
            rows={2}
            maxLength={200}
          />
        </div>

        {/* Location */}
        <div className="mb-6">
          <LocationDescriptionInput
            value={locationDescription}
            onChange={setLocationDescription}
            placeholder={t('mapUI.wherePlaceholder')}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!activity || !title.trim() || isLoading}
            className="flex-1 h-12 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
          >
            {isLoading ? t('loading') : t('groupSignal.create')}
          </Button>
        </div>
      </div>
    </div>
  );
}
