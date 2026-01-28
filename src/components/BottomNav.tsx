import { forwardRef } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { MapPin, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/map', icon: <MapPin className="h-6 w-6" />, label: 'Carte' },
  { to: '/profile', icon: <User className="h-6 w-6" />, label: 'Profil' },
  { to: '/settings', icon: <Settings className="h-6 w-6" />, label: 'Paramètres' },
];

export const BottomNav = forwardRef<HTMLElement, Record<string, never>>(
  function BottomNav(_, ref) {
    const location = useLocation();

    return (
      <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="mx-auto max-w-[500px]">
          <div className="mx-4 mb-4 glass-strong rounded-2xl">
            <div className="flex items-center justify-around py-3 px-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <RouterNavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex flex-col items-center gap-1 transition-all duration-300',
                      isActive
                        ? 'text-coral scale-110'
                        : 'text-gray-400 hover:text-gray-300'
                    )}
                  >
                    <div className={cn(
                      'transition-all duration-300',
                      isActive && 'drop-shadow-[0_0_8px_hsl(var(--coral)/0.6)]'
                    )}>
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
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
