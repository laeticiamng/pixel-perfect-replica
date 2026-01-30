import { forwardRef } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { MapPin, User, Settings, CalendarDays, Users2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShowNewBadge } from '@/components/binome/NewBadge';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  showNewBadge?: boolean;
}

export const BottomNav = forwardRef<HTMLElement, Record<string, never>>(
  function BottomNav(_, ref) {
    const location = useLocation();
    const showBinomeBadge = useShowNewBadge();

    const navItems: NavItem[] = [
      { to: '/map', icon: <MapPin className="h-6 w-6" />, label: 'Carte' },
      { to: '/binome', icon: <Users2 className="h-6 w-6" />, label: 'Réserver', showNewBadge: showBinomeBadge },
      { to: '/events', icon: <CalendarDays className="h-6 w-6" />, label: 'Events' },
      { to: '/profile', icon: <User className="h-6 w-6" />, label: 'Profil' },
      { to: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Réglages' },
    ];

    return (
      <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 safe-bottom lg:hidden">
        <div className="mx-auto max-w-[500px]">
          <div className="mx-4 mb-4 glass-strong rounded-2xl shadow-medium">
            <div className="flex items-center justify-around py-3.5 px-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <RouterNavLink
                    key={item.to}
                    to={item.to}
                    aria-label={`Naviguer vers ${item.label}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex flex-col items-center gap-1.5 transition-all duration-300 relative',
                      isActive
                        ? 'text-coral scale-110'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {isActive && (
                      <div className="absolute -inset-2 bg-coral/10 rounded-xl -z-10" />
                    )}
                    <div className={cn(
                      'transition-all duration-300 relative',
                      isActive && 'drop-shadow-[0_0_12px_hsl(var(--coral)/0.7)]'
                    )}>
                      {item.icon}
                      {/* New badge */}
                      {item.showNewBadge && !isActive && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-2 h-2 bg-coral rounded-full animate-pulse" />
                      )}
                    </div>
                    <span className={cn(
                      'text-xs',
                      isActive ? 'font-bold' : 'font-medium'
                    )}>{item.label}</span>
                  </RouterNavLink>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    );
  }
);

BottomNav.displayName = 'BottomNav';
