import { useState } from 'react';
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
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '../ThemeToggle';
import { useShortcutHint } from '@/hooks/useKeyboardShortcuts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  group?: string;
}

const mainNavItems: NavItem[] = [
  { to: '/map', icon: <MapPin className="h-5 w-5" />, label: 'Carte', group: 'main' },
  { to: '/binome', icon: <Users2 className="h-5 w-5" />, label: 'Réserver', group: 'main' },
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
  const { cmdKey } = useShortcutHint();
  const [collapsed, setCollapsed] = useState(false);
  
  // Open command palette
  const openCommandPalette = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  };
  
  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.to;
    
    const linkContent = (
      <RouterNavLink
        key={item.to}
        to={item.to}
        aria-label={`Naviguer vers ${item.label}`}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-xl transition-all duration-200',
          'hover:bg-muted/50',
          collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
          isActive
            ? 'bg-coral/10 text-coral font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <span className={cn(
          'transition-all flex-shrink-0',
          isActive && 'drop-shadow-[0_0_8px_hsl(var(--coral)/0.5)]'
        )}>
          {item.icon}
        </span>
        {!collapsed && <span className="text-sm">{item.label}</span>}
      </RouterNavLink>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.to} delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <TooltipProvider>
      <aside className={cn(
        "hidden lg:flex fixed left-0 top-0 bottom-0 flex-col glass-strong border-r border-border/50 z-50 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}>
        {/* Logo */}
        <div className={cn(
          "border-b border-border/50 transition-all duration-300",
          collapsed ? "p-4" : "p-6"
        )}>
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "gap-3"
          )}>
            <img 
              src="/easy-logo.png" 
              alt="EASY" 
              className={cn(
                "rounded-xl transition-all duration-300",
                collapsed ? "h-8 w-8" : "h-10 w-10"
              )}
            />
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold text-coral">EASY</h1>
                <p className="text-xs text-muted-foreground">Rencontres IRL</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Search Button */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-border/50">
            <button
              onClick={openCommandPalette}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground transition-all"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm flex-1 text-left">Rechercher...</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-background/80 border border-border text-xs font-mono">
                {cmdKey}K
              </kbd>
            </button>
          </div>
        )}

        {collapsed && (
          <div className="px-3 py-3 border-b border-border/50">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={openCommandPalette}
                  className="w-full flex items-center justify-center p-2 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground transition-all"
                >
                  <Search className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Rechercher ({cmdKey}K)
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        
        {/* User Profile Mini */}
        {profile && (
          <div className={cn(
            "border-b border-border/50 transition-all duration-300",
            collapsed ? "p-3" : "p-4"
          )}>
            <div className={cn(
              "flex items-center",
              collapsed ? "justify-center" : "gap-3 px-2"
            )}>
              {collapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center overflow-hidden cursor-default">
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
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-medium">{profile.first_name}</p>
                    <p className="text-xs text-muted-foreground">{profile.university || 'Étudiant'}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={cn(
          "flex-1 overflow-y-auto space-y-6 transition-all duration-300",
          collapsed ? "p-2" : "p-4"
        )}>
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 mb-2">
                Navigation
              </p>
            )}
            {mainNavItems.map(renderNavItem)}
          </div>

          {/* Account Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 mb-2">
                Compte
              </p>
            )}
            {secondaryNavItems.map(renderNavItem)}
          </div>
        </nav>

        {/* Footer */}
        <div className={cn(
          "border-t border-border/50 space-y-2 transition-all duration-300",
          collapsed ? "p-2" : "p-4"
        )}>
          {/* Theme Toggle */}
          {!collapsed && (
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-muted-foreground">Thème</span>
              <ThemeToggle />
            </div>
          )}

          {collapsed && (
            <div className="flex justify-center py-2">
              <ThemeToggle />
            </div>
          )}
          
          {/* Logout */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center p-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Déconnexion
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">Déconnexion</span>
            </button>
          )}

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all",
              collapsed ? "px-2" : "px-4"
            )}
            aria-label={collapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Réduire</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

// Export collapsed width for PageLayout
export const SIDEBAR_WIDTH = 256; // 16rem = w-64
export const SIDEBAR_COLLAPSED_WIDTH = 72; // w-[72px]
