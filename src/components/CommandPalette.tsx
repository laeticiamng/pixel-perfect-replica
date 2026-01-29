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

interface CommandItem {
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

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // Escape to close
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

  const navigationItems: CommandItem[] = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home,
      action: () => navigate('/'),
      keywords: ['landing', 'home', 'accueil'],
      group: 'navigation',
    },
    {
      id: 'map',
      label: 'Carte / Radar',
      icon: Map,
      action: () => navigate('/map'),
      keywords: ['map', 'carte', 'radar', 'signal'],
      group: 'navigation',
    },
    {
      id: 'profile',
      label: 'Mon Profil',
      icon: User,
      action: () => navigate('/profile'),
      keywords: ['profile', 'profil', 'compte'],
      group: 'navigation',
    },
    {
      id: 'binome',
      label: 'Binôme',
      icon: Users,
      action: () => navigate('/binome'),
      keywords: ['binome', 'session', 'groupe'],
      group: 'navigation',
    },
    {
      id: 'events',
      label: 'Événements',
      icon: Calendar,
      action: () => navigate('/events'),
      keywords: ['events', 'evenements', 'agenda'],
      group: 'navigation',
    },
    {
      id: 'statistics',
      label: 'Statistiques',
      icon: BarChart3,
      action: () => navigate('/statistics'),
      keywords: ['stats', 'statistiques', 'analytics'],
      group: 'navigation',
    },
    {
      id: 'people-met',
      label: 'Personnes rencontrées',
      icon: Users,
      action: () => navigate('/people-met'),
      keywords: ['people', 'rencontres', 'contacts'],
      group: 'navigation',
    },
  ];

  const settingsItems: CommandItem[] = [
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      action: () => navigate('/settings'),
      keywords: ['settings', 'parametres', 'config'],
      group: 'settings',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      action: () => navigate('/notifications-settings'),
      keywords: ['notifications', 'alerts', 'alertes'],
      group: 'settings',
    },
    {
      id: 'privacy',
      label: 'Confidentialité',
      icon: Shield,
      action: () => navigate('/privacy-settings'),
      keywords: ['privacy', 'confidentialite', 'securite'],
      group: 'settings',
    },
    {
      id: 'password',
      label: 'Changer le mot de passe',
      icon: Lock,
      action: () => navigate('/change-password'),
      keywords: ['password', 'mot de passe', 'securite'],
      group: 'settings',
    },
    {
      id: 'blocked',
      label: 'Utilisateurs bloqués',
      icon: UserX,
      action: () => navigate('/blocked-users'),
      keywords: ['blocked', 'bloques', 'ban'],
      group: 'settings',
    },
    {
      id: 'export',
      label: 'Exporter mes données',
      icon: Download,
      action: () => navigate('/data-export'),
      keywords: ['export', 'gdpr', 'donnees'],
      group: 'settings',
    },
  ];

  const actionItems: CommandItem[] = [
    {
      id: 'toggle-theme',
      label: theme === 'dark' ? 'Mode clair' : 'Mode sombre',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      keywords: ['theme', 'dark', 'light', 'sombre', 'clair'],
      group: 'actions',
    },
    {
      id: 'help',
      label: 'Aide',
      icon: HelpCircle,
      action: () => navigate('/help'),
      keywords: ['help', 'aide', 'support', 'faq'],
      group: 'actions',
    },
    {
      id: 'feedback',
      label: 'Donner un avis',
      icon: MessageSquare,
      action: () => navigate('/feedback'),
      keywords: ['feedback', 'avis', 'commentaire'],
      group: 'actions',
    },
    {
      id: 'logout',
      label: 'Déconnexion',
      icon: LogOut,
      action: () => signOut(),
      keywords: ['logout', 'deconnexion', 'sortir'],
      group: 'actions',
    },
  ];

  // Filter items based on auth state
  const allItems = isAuthenticated 
    ? [...navigationItems, ...settingsItems, ...actionItems]
    : [navigationItems[0], actionItems.find(i => i.id === 'toggle-theme')!];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher une page ou une action..." />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        
        {isAuthenticated && (
          <>
            <CommandGroup heading="Navigation">
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
            
            <CommandGroup heading="Paramètres">
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
        
        <CommandGroup heading="Actions">
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
