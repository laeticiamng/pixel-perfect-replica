import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Map,
  User,
  Settings,
  Calendar,
  Users,
  BarChart3,
  Bell,
  Shield,
  HelpCircle,
  MessageSquare,
  LogOut,
  Moon,
  Sun,
  Home,
  Lock,
  Download,
  UserX,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n';

interface CommandItemData {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
  group: 'navigation' | 'settings' | 'actions';
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open]);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const navigationItems: CommandItemData[] = [
    { id: 'home', label: t('commandPalette.home'), icon: Home, action: () => navigate('/'), keywords: ['landing', 'home', 'accueil'], group: 'navigation' },
    { id: 'map', label: t('commandPalette.mapRadar'), icon: Map, action: () => navigate('/map'), keywords: ['map', 'carte', 'radar', 'signal'], group: 'navigation' },
    { id: 'profile', label: t('commandPalette.myProfile'), icon: User, action: () => navigate('/profile'), keywords: ['profile', 'profil', 'compte'], group: 'navigation' },
    { id: 'binome', label: t('commandPalette.binome'), icon: Users, action: () => navigate('/binome'), keywords: ['binome', 'session', 'groupe'], group: 'navigation' },
    { id: 'events', label: t('commandPalette.events'), icon: Calendar, action: () => navigate('/events'), keywords: ['events', 'evenements', 'agenda'], group: 'navigation' },
    { id: 'statistics', label: t('commandPalette.statistics'), icon: BarChart3, action: () => navigate('/statistics'), keywords: ['stats', 'statistiques', 'analytics'], group: 'navigation' },
    { id: 'people-met', label: t('commandPalette.peopleMet'), icon: Users, action: () => navigate('/people-met'), keywords: ['people', 'rencontres', 'contacts'], group: 'navigation' },
  ];

  const settingsItems: CommandItemData[] = [
    { id: 'settings', label: t('commandPalette.settings'), icon: Settings, action: () => navigate('/settings'), keywords: ['settings', 'parametres', 'config'], group: 'settings' },
    { id: 'notifications', label: t('commandPalette.notifications'), icon: Bell, action: () => navigate('/notifications-settings'), keywords: ['notifications', 'alerts', 'alertes'], group: 'settings' },
    { id: 'privacy', label: t('commandPalette.privacy'), icon: Shield, action: () => navigate('/privacy-settings'), keywords: ['privacy', 'confidentialite', 'securite'], group: 'settings' },
    { id: 'password', label: t('commandPalette.changePassword'), icon: Lock, action: () => navigate('/change-password'), keywords: ['password', 'mot de passe', 'securite'], group: 'settings' },
    { id: 'blocked', label: t('commandPalette.blockedUsers'), icon: UserX, action: () => navigate('/blocked-users'), keywords: ['blocked', 'bloques', 'ban'], group: 'settings' },
    { id: 'export', label: t('commandPalette.exportData'), icon: Download, action: () => navigate('/data-export'), keywords: ['export', 'gdpr', 'donnees'], group: 'settings' },
  ];

  const actionItems: CommandItemData[] = [
    { id: 'toggle-theme', label: theme === 'dark' ? t('commandPalette.lightMode') : t('commandPalette.darkMode'), icon: theme === 'dark' ? Sun : Moon, action: () => setTheme(theme === 'dark' ? 'light' : 'dark'), keywords: ['theme', 'dark', 'light', 'sombre', 'clair'], group: 'actions' },
    { id: 'help', label: t('commandPalette.help'), icon: HelpCircle, action: () => navigate('/help'), keywords: ['help', 'aide', 'support', 'faq'], group: 'actions' },
    { id: 'feedback', label: t('commandPalette.feedback'), icon: MessageSquare, action: () => navigate('/feedback'), keywords: ['feedback', 'avis', 'commentaire'], group: 'actions' },
    { id: 'logout', label: t('commandPalette.logout'), icon: LogOut, action: () => signOut(), keywords: ['logout', 'deconnexion', 'sortir'], group: 'actions' },
  ];

  const allItems = isAuthenticated 
    ? [...navigationItems, ...settingsItems, ...actionItems]
    : [navigationItems[0], actionItems.find(i => i.id === 'toggle-theme')!];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t('commandPalette.placeholder')} />
      <CommandList>
        <CommandEmpty>{t('commandPalette.noResults')}</CommandEmpty>
        
        {isAuthenticated && (
          <>
            <CommandGroup heading={t('commandPalette.navGroup')}>
              {navigationItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                  onSelect={() => runCommand(item.action)}
                  className="cursor-pointer"
                >
                  <item.icon className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t('commandPalette.settingsGroup')}>
              {settingsItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                  onSelect={() => runCommand(item.action)}
                  className="cursor-pointer"
                >
                  <item.icon className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        
        <CommandGroup heading={t('commandPalette.actionsGroup')}>
          {actionItems
            .filter(item => isAuthenticated || item.id === 'toggle-theme')
            .map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                onSelect={() => runCommand(item.action)}
                className="cursor-pointer"
              >
                <item.icon className="mr-3 h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}