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
    <header className={cn("safe-top px-6 py-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={() => backTo ? navigate(backTo) : navigate(-1)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label={t('back')}
            >
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {(rightContent || action) && (
          <div className="flex items-center gap-2">
            {rightContent}
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
