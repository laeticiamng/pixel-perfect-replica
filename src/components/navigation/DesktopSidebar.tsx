import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  User, 
  Settings, 
  CalendarDays, 
  Users2, 
  HelpCircle,
  BarChart3,
  Bell,
  Shield,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '../ThemeToggle';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  group?: string;
}

const mainNavItems: NavItem[] = [
  { to: '/map', icon: <MapPin className="h-5 w-5" />, label: 'Carte', group: 'main' },
  { to: '/binome', icon: <Users2 className="h-5 w-5" />, label: 'Binôme', group: 'main' },
  { to: '/events', icon: <CalendarDays className="h-5 w-5" />, label: 'Événements', group: 'main' },
  { to: '/profile', icon: <User className="h-5 w-5" />, label: 'Profil', group: 'main' },
];

const secondaryNavItems: NavItem[] = [
  { to: '/statistics', icon: <BarChart3 className="h-5 w-5" />, label: 'Statistiques', group: 'account' },
  { to: '/notifications-settings', icon: <Bell className="h-5 w-5" />, label: 'Notifications', group: 'account' },
  { to: '/privacy-settings', icon: <Shield className="h-5 w-5" />, label: 'Confidentialité', group: 'account' },
  { to: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Paramètres', group: 'account' },
  { to: '/help', icon: <HelpCircle className="h-5 w-5" />, label: 'Aide', group: 'support' },
];

export function DesktopSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  
  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.to;
    
    return (
      <RouterNavLink
        key={item.to}
        to={item.to}
        aria-label={`Naviguer vers ${item.label}`}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
          'hover:bg-muted/50',
          isActive
            ? 'bg-coral/10 text-coral font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <span className={cn(
          'transition-all',
          isActive && 'drop-shadow-[0_0_8px_hsl(var(--coral)/0.5)]'
        )}>
          {item.icon}
        </span>
        <span className="text-sm">{item.label}</span>
      </RouterNavLink>
    );
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col glass-strong border-r border-border/50 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <img 
            src="/easy-logo.png" 
            alt="EASY" 
            className="h-10 w-10 rounded-xl"
          />
          <div>
            <h1 className="text-xl font-bold text-coral">EASY</h1>
            <p className="text-xs text-muted-foreground">Rencontres IRL</p>
          </div>
        </div>
      </div>
      
      {/* User Profile Mini */}
      {profile && (
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.first_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-coral font-bold">
                  {profile.first_name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {profile.first_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.university || 'Étudiant'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 mb-2">
            Navigation
          </p>
          {mainNavItems.map(renderNavItem)}
        </div>

        {/* Account Navigation */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 mb-2">
            Compte
          </p>
          {secondaryNavItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 space-y-3">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm text-muted-foreground">Thème</span>
          <ThemeToggle />
        </div>
        
        {/* Logout */}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
