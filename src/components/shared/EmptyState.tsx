import { ReactNode, ComponentType } from 'react';
import { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: ComponentType<LucideProps> | ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: 'default' | 'outline' | 'ghost';
  variant?: 'default' | 'outline';
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'default',
  variant = 'default',
  className,
  children,
}: EmptyStateProps) {
  // Cast to component type for rendering - handles both regular components and forwardRef
  const IconComponent = Icon as ComponentType<LucideProps>;
  const isComponent = typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && '$$typeof' in Icon);
  
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="text-muted-foreground mx-auto mb-4">
        {isComponent ? (
          <IconComponent className="h-12 w-12 mx-auto" />
        ) : (
          <div className="[&>svg]:h-12 [&>svg]:w-12 [&>svg]:mx-auto">
            {Icon as ReactNode}
          </div>
        )}
      </div>
      <h3 className="font-medium text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button 
          variant={variant === 'outline' ? 'outline' : actionVariant}
          onClick={onAction}
          className={actionVariant === 'default' && variant !== 'outline' ? 'bg-coral hover:bg-coral/90' : ''}
        >
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
}
