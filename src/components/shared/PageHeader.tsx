import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  showBack?: boolean;
  rightContent?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  backTo,
  showBack = true,
  rightContent,
  action,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className={cn("safe-top px-4 sm:px-6 py-3 sm:py-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {showBack && (
            <button
              onClick={() => backTo ? navigate(backTo) : navigate(-1)}
              className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
              aria-label={t('back')}
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {(rightContent || action) && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {rightContent}
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
