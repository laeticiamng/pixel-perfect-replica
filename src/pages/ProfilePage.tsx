import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { User, Bell, Lock, BarChart3, Users, HelpCircle, MessageSquare, AlertTriangle, LogOut, ChevronRight, Crown, GraduationCap, Gift, Copy, Share2, CalendarDays, Settings, UserCheck, Trophy, Download } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BottomNav } from '@/components/BottomNav';
import { PageLayout } from '@/components/PageLayout';
import { SwipeIndicator } from '@/components/SwipeIndicator';
import { ProfileQRCode } from '@/components/profile';
import { useAuth } from '@/contexts/AuthContext';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { APP_VERSION } from '@/lib/constants';
import { useReferral } from '@/hooks/useReferral';
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
  const { referralCode, referralsCount, shareLink } = useReferral();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleCopyReferralLink = async () => {
    if (!shareLink) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'NEARVITY', text: t('referral.shareDesc'), url: shareLink });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareLink);
      toast.success(t('referral.copied'));
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const { error } = await signOut();
    if (error) {
      setIsLoggingOut(false);
      toast.error(t('errors.generic'));
      return;
    }
    toast.success(t('profile.seeYouSoon'));
    navigate('/');
  };




  const menuSections: MenuSection[] = [
    {
      title: t('profile.account'),
      items: [
        { icon: <User className="h-5 w-5" />, label: t('profile.editProfile'), route: '/profile/edit' },
        { icon: <Crown className="h-5 w-5" />, label: t('profile.goPremium'), route: '/premium' },
        { icon: <Bell className="h-5 w-5" />, label: t('nav.notifications'), route: '/notifications' },
        { icon: <Settings className="h-5 w-5" />, label: t('nav.settings'), route: '/settings' },
      ],
    },
    {
      title: t('profile.history'),
      items: [
        { icon: <UserCheck className="h-5 w-5" />, label: t('connections.title'), route: '/connections' },
        { icon: <CalendarDays className="h-5 w-5" />, label: t('nav.events'), route: '/events' },
        { icon: <Trophy className="h-5 w-5" />, label: t('gamification.achievements'), route: '/achievements' },
        { icon: <BarChart3 className="h-5 w-5" />, label: t('profile.myStats'), route: '/statistics' },
        { icon: <Users className="h-5 w-5" />, label: t('profile.peopleMet'), route: '/people-met' },
        { icon: <Download className="h-5 w-5" />, label: t('dataExport.title'), route: '/data-export' },
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
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
    <PageLayout className="pb-28">
      <div className="max-w-2xl mx-auto w-full">
        {/* Profile Header */}
        <header className="safe-top px-4 sm:px-6 py-8">
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
              <GraduationCap className="h-4 w-4 inline mr-1" />{profile.university}
            </p>
          )}
          
          {/* QR Code button */}
          {profile?.id && (
            <div className="mt-4 animate-fade-in" style={{ animationDelay: '0.12s' }}>
              <ProfileQRCode
                userId={profile.id}
                firstName={profile.first_name}
                avatarUrl={profile.avatar_url}
              />
            </div>
          )}
          
          {/* Stats with enhanced styling */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mt-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <button
              onClick={() => navigate('/statistics')}
              aria-label={`${stats?.interactions || 0} ${t('profile.interactions')} — ${t('profile.myStats')}`}
              className="text-center glass rounded-2xl px-5 py-3 hover:scale-105 hover:bg-card/90 active:scale-95 transition-all duration-300"
            >
              <p className="text-2xl font-bold text-foreground">{stats?.interactions || 0}</p>
              <p className="text-xs text-muted-foreground font-medium">{t('profile.interactions')}</p>
            </button>
            <button
              onClick={() => navigate('/statistics')}
              aria-label={`${Math.round(stats?.hours_active || 0)}h ${t('profile.active')} — ${t('profile.myStats')}`}
              className="text-center glass rounded-2xl px-5 py-3 hover:scale-105 hover:bg-card/90 active:scale-95 transition-all duration-300"
            >
              <p className="text-2xl font-bold text-foreground">{Math.round(stats?.hours_active || 0)}h</p>
              <p className="text-xs text-muted-foreground font-medium">{t('profile.active')}</p>
            </button>
            <button
              onClick={() => navigate('/statistics')}
              aria-label={`${stats?.rating != null ? stats.rating.toFixed(1) : '5.0'} ${t('profile.rating')} — ${t('profile.myStats')}`}
              className="text-center glass rounded-2xl px-5 py-3 hover:scale-105 hover:bg-card/90 active:scale-95 transition-all duration-300"
            >
              <p className="text-2xl font-bold bg-gradient-to-r from-coral to-coral-light bg-clip-text text-transparent">{stats?.rating != null ? stats.rating.toFixed(1) : '5.0'}</p>
              <p className="text-xs text-muted-foreground font-medium">{t('profile.rating')}</p>
            </button>
          </div>
        </div>
      </header>

      {/* Menu Sections */}
      <div className="px-4 sm:px-6 space-y-6">
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

        {/* Logout with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-[0.98] transition-all duration-200 shadow-soft animate-slide-up"
              style={{ animationDelay: '0.5s' }}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-bold">{t('nav.logout')}</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('nav.logout')}</AlertDialogTitle>
              <AlertDialogDescription>{t('profile.logoutConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('nav.logout')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Referral Section */}
        {referralCode && (
          <div className="animate-slide-up" style={{ animationDelay: '0.45s' }}>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {t('referral.inviteFriends')}
            </h2>
            <div className="glass rounded-2xl p-5 shadow-soft space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-coral/20">
                  <Gift className="h-5 w-5 text-coral" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{t('referral.shareTitle')}</p>
                  <p className="text-xs text-muted-foreground">{t('referral.shareDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-2.5">
                <span className="text-xs text-muted-foreground">{t('referral.yourCode')}:</span>
                <span className="font-mono font-bold text-coral text-sm flex-1">{referralCode}</span>
                <span className="text-xs text-muted-foreground">{referralsCount} {t('referral.referralsCount')}</span>
              </div>
              <button
                onClick={handleCopyReferralLink}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-coral/10 text-coral hover:bg-coral/20 active:scale-[0.98] transition-all font-medium text-sm"
              >
                {navigator.share ? <Share2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {navigator.share ? t('referral.shareNative') : t('referral.copyLink')}
              </button>
            </div>
          </div>
        )}

        {/* Version */}
        <Link
          to="/changelog" 
          className="block text-center text-xs text-muted-foreground py-4 font-medium hover:text-coral transition-colors"
        >
          NEARVITY v{APP_VERSION} — Changelog
        </Link>
      </div>

      {/* Swipe Indicator */}
      <div className="fixed bottom-24 left-0 right-0 z-40 pointer-events-none">
        <SwipeIndicator currentIndex={currentRouteIndex} totalRoutes={totalRoutes} />
      </div>

      <BottomNav />
      </div>
    </PageLayout>
    </>
  );
}
