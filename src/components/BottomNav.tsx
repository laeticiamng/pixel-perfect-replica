import { forwardRef } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Radar, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

export const BottomNav = forwardRef<HTMLElement, Record<string, never>>(
  function BottomNav(_, ref) {
    const location = useLocation();

    const navItems: NavItem[] = [
      { to: '/app/radar', icon: <Radar className="h-6 w-6" />, label: 'Radar' },
      { to: '/app/messages', icon: <MessageCircle className="h-6 w-6" />, label: 'Messages' },
      { to: '/app/profil', icon: <User className="h-6 w-6" />, label: 'Profil' },
    ];

    return (
      <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 safe-bottom lg:hidden">
        <div className="mx-auto max-w-[430px]">
          <div className="mx-4 mb-4 glass-strong rounded-2xl shadow-medium">
            <div className="flex items-center justify-around py-3.5 px-6">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <RouterNavLink
                    key={item.to}
                    to={item.to}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex flex-col items-center gap-1.5 transition-all duration-300 relative',
                      isActive
                        ? 'text-violet scale-110'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {isActive && (
                      <div className="absolute -inset-2 bg-violet/10 rounded-xl -z-10" />
                    )}
                    <div className={cn(
                      'transition-all duration-300 relative',
                      isActive && 'drop-shadow-[0_0_12px_hsl(var(--violet)/0.7)]'
                    )}>
                      {item.icon}
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
