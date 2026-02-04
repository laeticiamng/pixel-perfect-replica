import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EventFavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function EventFavoriteButton({ 
  isFavorite, 
  onToggle, 
  isLoading = false,
  size = 'sm',
  className 
}: EventFavoriteButtonProps) {
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  
  return (
    <Button
      variant="ghost"
      size={size === 'sm' ? 'icon' : 'default'}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={isLoading}
      className={cn(
        'transition-all',
        isFavorite 
          ? 'text-coral hover:text-coral/80' 
          : 'text-muted-foreground hover:text-coral',
        size === 'sm' ? 'h-8 w-8' : 'h-10 px-3',
        className
      )}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {isLoading ? (
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
