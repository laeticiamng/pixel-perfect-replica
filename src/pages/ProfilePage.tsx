import { useNavigate } from 'react-router-dom';
import { User, Bell, Lock, BarChart3, Users, HelpCircle, MessageSquare, AlertTriangle, LogOut, ChevronRight, Crown } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { PageLayout } from '@/components/PageLayout';
import { SwipeIndicator } from '@/components/SwipeIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useTranslation } from '@/lib/i18n';
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
  const { currentRouteIndex, totalRoutes } = useSwipeNavigation();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await signOut();
    toast.success(t('profile.seeYouSoon'));
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
      title: t('profile.account'),
      items: [
        { icon: <User className="h-5 w-5" />, label: t('profile.editProfile'), route: '/profile/edit' },
        { icon: <Crown className="h-5 w-5" />, label: t('profile.goPremium'), route: '/premium' },
        { icon: <Bell className="h-5 w-5" />, label: t('settings.notifications'), onClick: handleNotifications },
        { icon: <Lock className="h-5 w-5" />, label: t('settings.privacy'), onClick: handlePrivacy },
      ],
    },
    {
      title: t('profile.history'),
      items: [
        { icon: <BarChart3 className="h-5 w-5" />, label: t('profile.myStats'), route: '/statistics' },
        { icon: <Users className="h-5 w-5" />, label: t('profile.peopleMet'), route: '/people-met' },
      ],
    },
    {
      title: t('profile.support'),
      items: [
        { icon: <HelpCircle className="h-5 w-5" />, label: t('profile.helpFaq'), route: '/help' },
        { icon: <MessageSquare className="h-5 w-5" />, label: t('profile.giveFeedback'), route: '/feedback' },
        { icon: <AlertTriangle className="h-5 w-5" />, label: t('profile.reportProblem'), route: '/report' },
      ],
    },
  ];

  return (
    <PageLayout className="pb-28">
      <div className="max-w-2xl mx-auto w-full">
        {/* Profile Header */}
        <header className="safe-top px-6 py-8">
        <div className="flex flex-col items-center">
          {/* Avatar with enhanced glow */}
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full bg-coral/30 blur-xl animate-breathing" />
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center glow-coral overflow-hidden relative shadow-medium">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-primary-foreground">
                  {profile?.first_name?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
          </div>
          
          {/* Name & Info */}
          <h1 className="text-2xl font-bold text-foreground mb-1 animate-fade-in">
            {profile?.first_name || t('profile.user')}
          </h1>
          <p className="text-muted-foreground text-sm mb-1 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            {profile?.email}
          </p>
          {profile?.university && (
            <p className="text-muted-foreground text-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
              🎓 {profile.university}
            </p>
          )}
          
          {/* Stats with enhanced styling */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mt-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <button 
              onClick={() => navigate('/statistics')}
              className="text-center glass rounded-2xl px-5 py-3 hover:scale-105 hover:bg-card/90 active:scale-95 transition-all duration-300"
            >
              <p className="text-2xl font-bold text-foreground">{stats?.interactions || 0}</p>
              <p className="text-xs text-muted-foreground font-medium">{t('profile.interactions')}</p>
            </button>
            <button 
              onClick={() => navigate('/statistics')}
              className="text-center glass rounded-2xl px-5 py-3 hover:scale-105 hover:bg-card/90 active:scale-95 transition-all duration-300"
            >
              <p className="text-2xl font-bold text-foreground">{Math.round(stats?.hours_active || 0)}h</p>
              <p className="text-xs text-muted-foreground font-medium">{t('profile.active')}</p>
            </button>
            <button 
              onClick={() => navigate('/statistics')}
              className="text-center glass rounded-2xl px-5 py-3 hover:scale-105 hover:bg-card/90 active:scale-95 transition-all duration-300"
            >
              <p className="text-2xl font-bold bg-gradient-to-r from-coral to-coral-light bg-clip-text text-transparent">{stats?.rating?.toFixed(1) || '5.0'}</p>
              <p className="text-xs text-muted-foreground font-medium">{t('profile.rating')}</p>
            </button>
          </div>
        </div>
      </header>

      {/* Menu Sections */}
      <div className="px-6 space-y-6">
        {menuSections.map((section, sectionIdx) => (
          <div key={section.title} className="animate-slide-up" style={{ animationDelay: `${0.2 + sectionIdx * 0.1}s` }}>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h2>
            <div className="glass rounded-2xl overflow-hidden shadow-soft">
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
                    'w-full flex items-center gap-4 px-5 py-4 transition-all duration-200',
                    'hover:bg-muted/50 active:bg-muted/70 active:scale-[0.98]',
                    index !== section.items.length - 1 && 'border-b border-border/50'
                  )}
                >
                  <span className="text-coral">{item.icon}</span>
                  <span className="flex-1 text-left text-foreground font-medium">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-[0.98] transition-all duration-200 shadow-soft animate-slide-up"
          style={{ animationDelay: '0.5s' }}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-bold">{t('nav.logout')}</span>
        </button>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground py-4 font-medium">
          EASY v1.3.0
        </p>
      </div>

      {/* Swipe Indicator */}
      <div className="fixed bottom-24 left-0 right-0 z-40 pointer-events-none">
        <SwipeIndicator currentIndex={currentRouteIndex} totalRoutes={totalRoutes} />
      </div>

      <BottomNav />
      </div>
    </PageLayout>
  );
}
