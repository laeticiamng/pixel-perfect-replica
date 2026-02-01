import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: 'default' | 'outline' | 'ghost';
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'outline',
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="text-muted-foreground mx-auto mb-4 [&>svg]:h-12 [&>svg]:w-12 [&>svg]:mx-auto">
        {icon}
      </div>
      <h3 className="font-medium text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button 
          variant={actionVariant}
          onClick={onAction}
          className={actionVariant === 'default' ? 'bg-coral hover:bg-coral/90' : ''}
        >
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
}
