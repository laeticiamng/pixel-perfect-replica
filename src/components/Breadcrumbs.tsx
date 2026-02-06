import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

type RouteKey = '/' | '/map' | '/profile' | '/settings' | '/profile/edit' | '/statistics' 
  | '/people-met' | '/help' | '/feedback' | '/report' | '/notifications-settings' 
  | '/privacy-settings' | '/change-password' | '/diagnostics' | '/install' | '/terms' | '/privacy';

interface RouteConfig {
  labelKey: string;
  parent?: string;
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
  '/': { labelKey: 'breadcrumbs.home' },
  '/map': { labelKey: 'breadcrumbs.map' },
  '/profile': { labelKey: 'breadcrumbs.profile' },
  '/settings': { labelKey: 'breadcrumbs.settings' },
  '/profile/edit': { labelKey: 'breadcrumbs.editProfile', parent: '/profile' },
  '/statistics': { labelKey: 'breadcrumbs.statistics', parent: '/profile' },
  '/people-met': { labelKey: 'breadcrumbs.peopleMet', parent: '/profile' },
  '/help': { labelKey: 'breadcrumbs.helpFaq', parent: '/profile' },
  '/feedback': { labelKey: 'breadcrumbs.feedback', parent: '/profile' },
  '/report': { labelKey: 'breadcrumbs.report', parent: '/profile' },
  '/notifications-settings': { labelKey: 'breadcrumbs.notifications', parent: '/profile' },
  '/privacy-settings': { labelKey: 'breadcrumbs.privacy', parent: '/profile' },
  '/change-password': { labelKey: 'breadcrumbs.password', parent: '/settings' },
  '/diagnostics': { labelKey: 'breadcrumbs.diagnostics', parent: '/settings' },
  '/install': { labelKey: 'breadcrumbs.install', parent: '/settings' },
  '/terms': { labelKey: 'breadcrumbs.terms', parent: '/' },
  '/privacy': { labelKey: 'breadcrumbs.privacy', parent: '/' },
};

interface BreadcrumbItem {
  labelKey: string;
  path: string;
}

function buildBreadcrumbPath(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  let currentPath = pathname;

  while (currentPath) {
    const config = ROUTE_CONFIG[currentPath];
    if (config) {
      items.unshift({ labelKey: config.labelKey, path: currentPath });
      currentPath = config.parent || '';
    } else {
      if (currentPath.startsWith('/reveal/')) {
        items.unshift({ labelKey: 'breadcrumbs.userProfile', path: currentPath });
        items.unshift({ labelKey: 'breadcrumbs.map', path: '/map' });
      }
      break;
    }
  }

  return items;
}

interface BreadcrumbsProps {
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ className, showHome = false }: BreadcrumbsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const items = buildBreadcrumbPath(location.pathname);
  
  if (items.length <= 1) return null;

  return (
    <nav 
      aria-label={t('breadcrumbs.ariaLabel')} 
      className={cn("flex items-center gap-1 text-sm overflow-x-auto", className)}
    >
      {showHome && (
        <>
          <button
            onClick={() => navigate('/')}
            className="p-1 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label={t('breadcrumbs.home')}
          >
            <Home className="h-4 w-4" />
          </button>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
        </>
      )}
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={item.path} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
            )}
            {isLast ? (
              <span className="text-foreground font-medium truncate max-w-[120px]">
                {t(item.labelKey as any)}
              </span>
            ) : (
              <button
                onClick={() => navigate(item.path)}
                className="text-muted-foreground hover:text-coral transition-colors truncate max-w-[100px]"
              >
                {t(item.labelKey as any)}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}