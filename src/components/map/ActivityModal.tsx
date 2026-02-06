import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActivitySelector, LocationDescriptionInput } from '@/components/radar';
import { ActivityType } from '@/types/signal';
import { useTranslation } from '@/lib/i18n';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedActivity: ActivityType | null;
  onActivitySelect: (activity: ActivityType) => void;
  locationDescription: string;
  onLocationChange: (value: string) => void;
  onConfirm: () => void;
  isActivating: boolean;
}

export function ActivityModal({
  isOpen, onClose, selectedActivity, onActivitySelect,
  locationDescription, onLocationChange, onConfirm, isActivating,
}: ActivityModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[500px] glass-strong rounded-t-3xl p-6 pb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('activityModal.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('activityModal.subtitle')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        
        <ActivitySelector selectedActivity={selectedActivity} onSelect={onActivitySelect} />

        <div className="mt-4">
          <LocationDescriptionInput
            value={locationDescription}
            onChange={onLocationChange}
            placeholder={t('activityModal.locationPlaceholder')}
          />
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => { onClose(); onLocationChange(''); }}
            className="flex-1 h-12 rounded-xl"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!selectedActivity || isActivating}
            className="flex-1 h-12 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
          >
            {isActivating ? t('activityModal.activating') : t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}