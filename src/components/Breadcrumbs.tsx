import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

// Route hierarchy mapping
const ROUTE_CONFIG: Record<string, { label: string; parent?: string }> = {
  '/': { label: 'Accueil' },
  '/map': { label: 'Carte' },
  '/profile': { label: 'Profil' },
  '/settings': { label: 'Paramètres' },
  '/profile/edit': { label: 'Modifier le profil', parent: '/profile' },
  '/statistics': { label: 'Statistiques', parent: '/profile' },
  '/people-met': { label: 'Personnes rencontrées', parent: '/profile' },
  '/help': { label: 'Aide & FAQ', parent: '/profile' },
  '/feedback': { label: 'Feedback', parent: '/profile' },
  '/report': { label: 'Signalement', parent: '/profile' },
  '/notifications-settings': { label: 'Notifications', parent: '/profile' },
  '/privacy-settings': { label: 'Confidentialité', parent: '/profile' },
  '/change-password': { label: 'Mot de passe', parent: '/settings' },
  '/diagnostics': { label: 'Diagnostics', parent: '/settings' },
  '/install': { label: 'Installation', parent: '/settings' },
  '/terms': { label: 'Conditions', parent: '/' },
  '/privacy': { label: 'Confidentialité', parent: '/' },
};

function buildBreadcrumbPath(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  let currentPath = pathname;

  while (currentPath) {
    const config = ROUTE_CONFIG[currentPath];
    if (config) {
      items.unshift({
        label: config.label,
        path: currentPath,
      });
      currentPath = config.parent || '';
    } else {
      // Handle dynamic routes like /reveal/:userId
      if (currentPath.startsWith('/reveal/')) {
        items.unshift({
          label: 'Profil utilisateur',
          path: currentPath,
        });
        items.unshift({
          label: 'Carte',
          path: '/map',
        });
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
  
  const items = buildBreadcrumbPath(location.pathname);
  
  // Don't show breadcrumbs on main pages or if only one item
  if (items.length <= 1) return null;

  return (
    <nav 
      aria-label="Fil d'Ariane" 
      className={cn("flex items-center gap-1 text-sm overflow-x-auto", className)}
    >
      {showHome && (
        <>
          <button
            onClick={() => navigate('/')}
            className="p-1 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Accueil"
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
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(item.path)}
                className="text-muted-foreground hover:text-coral transition-colors truncate max-w-[100px]"
              >
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
