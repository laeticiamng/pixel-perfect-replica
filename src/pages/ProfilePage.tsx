import { useNavigate } from 'react-router-dom';
import { User, Bell, Lock, BarChart3, Users, HelpCircle, MessageSquare, AlertTriangle, LogOut, ChevronRight } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  route?: string;
  danger?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, stats, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success('À bientôt !');
    navigate('/');
  };

  const handleNotifications = () => {
    navigate('/notifications-settings');
  };

  const handlePrivacy = () => {
    navigate('/privacy-settings');
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Compte',
      items: [
        { icon: <User className="h-5 w-5" />, label: 'Modifier le profil', route: '/profile/edit' },
        { icon: <Bell className="h-5 w-5" />, label: 'Notifications', onClick: handleNotifications },
        { icon: <Lock className="h-5 w-5" />, label: 'Confidentialité', onClick: handlePrivacy },
      ],
    },
    {
      title: 'Historique',
      items: [
        { icon: <BarChart3 className="h-5 w-5" />, label: 'Mes statistiques', route: '/statistics' },
        { icon: <Users className="h-5 w-5" />, label: 'Personnes rencontrées', route: '/people-met' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: <HelpCircle className="h-5 w-5" />, label: 'Aide & FAQ', route: '/help' },
        { icon: <MessageSquare className="h-5 w-5" />, label: 'Donner un feedback', route: '/feedback' },
        { icon: <AlertTriangle className="h-5 w-5" />, label: 'Signaler un problème', route: '/report' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-radial pb-28">
      {/* Profile Header */}
      <header className="safe-top px-6 py-8">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-coral flex items-center justify-center mb-4 glow-coral overflow-hidden">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-primary-foreground">
                {profile?.first_name?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
          
          {/* Name & Info */}
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {profile?.first_name || 'Utilisateur'}
          </h1>
          <p className="text-muted-foreground text-sm mb-1">
            {profile?.email}
          </p>
          {profile?.university && (
            <p className="text-muted-foreground text-sm">
              🎓 {profile.university}
            </p>
          )}
          
          {/* Stats */}
          <div className="flex gap-8 mt-6">
            <button 
              onClick={() => navigate('/statistics')}
              className="text-center hover:scale-105 transition-transform"
            >
              <p className="text-2xl font-bold text-foreground">{stats?.interactions || 0}</p>
              <p className="text-xs text-muted-foreground">Interactions</p>
            </button>
            <button 
              onClick={() => navigate('/statistics')}
              className="text-center hover:scale-105 transition-transform"
            >
              <p className="text-2xl font-bold text-foreground">{Math.round(stats?.hours_active || 0)}h</p>
              <p className="text-xs text-muted-foreground">Actif</p>
            </button>
            <button 
              onClick={() => navigate('/statistics')}
              className="text-center hover:scale-105 transition-transform"
            >
              <p className="text-2xl font-bold text-coral">{stats?.rating?.toFixed(1) || '5.0'}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </button>
          </div>
        </div>
      </header>

      {/* Menu Sections */}
      <div className="px-6 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h2>
            <div className="glass rounded-xl overflow-hidden">
              {section.items.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.route) {
                      navigate(item.route);
                    } else if (item.onClick) {
                      item.onClick();
                    }
                  }}
                  className={cn(
                    'w-full flex items-center gap-4 px-4 py-3.5 transition-colors',
                    'hover:bg-muted/50',
                    index !== section.items.length - 1 && 'border-b border-border'
                  )}
                >
                  <span className="text-muted-foreground">{item.icon}</span>
                  <span className="flex-1 text-left text-foreground">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Déconnexion</span>
        </button>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground py-4">
          SIGNAL v1.0.0
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
