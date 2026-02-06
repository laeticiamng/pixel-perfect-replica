import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface EventFavoriteButtonProps {
  eventId: string;
  isFavorite: boolean;
  onToggle: (eventId: string) => void | Promise<any>;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function EventFavoriteButton({ 
  eventId,
  isFavorite, 
  onToggle, 
  disabled = false,
  size = 'sm',
  className 
}: EventFavoriteButtonProps) {
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const { t } = useTranslation();
  
  return (
    <Button
      variant="ghost"
      size={size === 'sm' ? 'icon' : 'default'}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggle(eventId);
      }}
      disabled={disabled}
      className={cn(
        'transition-all',
        isFavorite 
          ? 'text-coral hover:text-coral/80' 
          : 'text-muted-foreground hover:text-coral',
        size === 'sm' ? 'h-8 w-8' : 'h-10 px-3',
        className
      )}
      aria-label={isFavorite ? t('favorites.remove') : t('favorites.add')}
    >
      {disabled ? (
        <Loader2 className={cn(iconSize, 'animate-spin')} />
      ) : (
        <Heart 
          className={cn(
            iconSize, 
            'transition-all',
            isFavorite && 'fill-current'
          )} 
        />
      )}
    </Button>
  );
}
