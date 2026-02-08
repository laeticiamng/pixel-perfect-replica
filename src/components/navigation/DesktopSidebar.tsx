import { useState, useEffect, useCallback } from 'react';
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
import { LanguageToggle } from '../LanguageToggle';
import { useShortcutHint } from '@/hooks/useKeyboardShortcuts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useShowNewBadge } from '@/components/binome/NewBadge';
import { useTranslation } from '@/lib/i18n';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  labelKey: string;
  group?: string;
  showNewBadge?: boolean;
}

const mainNavItems: NavItem[] = [
  { to: '/map', icon: <MapPin className="h-5 w-5" />, labelKey: 'nav.map', group: 'main' },
  { to: '/binome', icon: <Users2 className="h-5 w-5" />, labelKey: 'nav.book', group: 'main', showNewBadge: true },
  { to: '/events', icon: <CalendarDays className="h-5 w-5" />, labelKey: 'nav.events', group: 'main' },
  { to: '/profile', icon: <User className="h-5 w-5" />, labelKey: 'nav.profile', group: 'main' },
];

const secondaryNavItems: NavItem[] = [
  { to: '/statistics', icon: <BarChart3 className="h-5 w-5" />, labelKey: 'nav.statistics', group: 'account' },
  { to: '/notifications-settings', icon: <Bell className="h-5 w-5" />, labelKey: 'nav.notifications', group: 'account' },
  { to: '/privacy-settings', icon: <Shield className="h-5 w-5" />, labelKey: 'nav.privacy', group: 'account' },
  { to: '/settings', icon: <Settings className="h-5 w-5" />, labelKey: 'nav.settings', group: 'account' },
  { to: '/help', icon: <HelpCircle className="h-5 w-5" />, labelKey: 'nav.help', group: 'support' },
];

export function DesktopSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { cmdKey } = useShortcutHint();
  const [collapsed, setCollapsed] = useState(false);
  const showBinomeBadge = useShowNewBadge();
  const { t } = useTranslation();
  
  // Toggle sidebar with keyboard shortcut (Cmd+B or Ctrl+B)
  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+B (Mac) or Ctrl+B (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);
  
  // Open command palette
  const openCommandPalette = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  };
  
  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.to;
    const shouldShowBadge = item.showNewBadge && showBinomeBadge && !isActive;
    const label = t(item.labelKey);
    
    const linkContent = (
      <RouterNavLink
        key={item.to}
        to={item.to}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-xl transition-all duration-200 relative group',
          'hover:bg-muted/50',
          collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
          isActive
            ? 'bg-coral/10 text-coral font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <span className={cn(
          'transition-all duration-200 flex-shrink-0 relative',
          isActive && 'drop-shadow-[0_0_8px_hsl(var(--coral)/0.5)]',
          // Smooth hover animation for icons in collapsed mode
          collapsed && 'group-hover:scale-110 group-hover:rotate-3'
        )}>
          {item.icon}
          {/* New badge indicator */}
          {shouldShowBadge && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-2 h-2 bg-coral rounded-full animate-pulse" />
          )}
        </span>
        {!collapsed && (
          <span className="text-sm flex items-center gap-2">
            {label}
            {shouldShowBadge && (
              <span className="text-[10px] font-bold text-white bg-coral px-1.5 py-0.5 rounded-full">
                New
              </span>
            )}
          </span>
        )}
      </RouterNavLink>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.to} delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium flex items-center gap-2">
            {label}
            {shouldShowBadge && (
              <span className="text-[10px] font-bold text-white bg-coral px-1.5 py-0.5 rounded-full">
                New
              </span>
            )}
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
              src="/nearvity-logo.png" 
              alt="NEARVITY" 
              className={cn(
                "rounded-xl transition-all duration-300",
                collapsed ? "h-8 w-8" : "h-10 w-10"
              )}
            />
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold text-coral">NEARVITY</h1>
                <p className="text-xs text-muted-foreground">{t('nav.irlMeetings')}</p>
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
              <span className="text-sm flex-1 text-left">{t('search')}...</span>
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
                {t('search')} ({cmdKey}K)
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
                    <p className="text-xs text-muted-foreground">{profile.university || t('nav.student')}</p>
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
                      {profile.university || t('nav.student')}
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
                {t('nav.navigation')}
              </p>
            )}
            {mainNavItems.map(renderNavItem)}
          </div>

          {/* Account Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 mb-2">
                {t('nav.account')}
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
          {/* Theme & Language Toggles */}
          {!collapsed && (
            <div className="flex flex-col gap-2 px-4 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('nav.theme')}</span>
                <LanguageToggle />
              </div>
              <ThemeToggle compact showLabels={false} />
            </div>
          )}

          {collapsed && (
            <div className="flex flex-col items-center gap-2 py-2">
              <LanguageToggle compact />
              <ThemeToggle compact showLabels={false} />
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
                {t('nav.logout')}
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">{t('nav.logout')}</span>
            </button>
          )}

          {/* Collapse Toggle */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={toggleSidebar}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all",
                  collapsed ? "px-2" : "px-4"
                )}
                aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 hover:translate-x-0.5" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 transition-transform duration-200 hover:-translate-x-0.5" />
                    <span className="text-xs">{t('nav.collapse')}</span>
                    <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-background/80 border border-border font-mono">
                      {cmdKey}B
                    </kbd>
                  </>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                {t('nav.expand')} ({cmdKey}B)
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}

// Export collapsed width for PageLayout
export const SIDEBAR_WIDTH = 256; // 16rem = w-64
export const SIDEBAR_COLLAPSED_WIDTH = 72; // w-[72px]
