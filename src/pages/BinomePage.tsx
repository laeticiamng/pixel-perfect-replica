import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, Clock, History, Crown } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BottomNav } from '@/components/BottomNav';
import { PageHeader, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { 
  SessionCard, SessionFilters, CreateSessionForm, SessionQuotaBadge,
  BinomeOnboarding, BinomeDescriptionCard, WhyNearvitySection, WhyNearvityCondensed, 
  TestimonialsSection, CommunityStats, AIRecommendationsWidget 
} from '@/components/binome';
import { useBinomeSessions, type SessionFilters as Filters, type CreateSessionInput } from '@/hooks/useBinomeSessions';
import { useSessionQuota } from '@/hooks/useSessionQuota';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';

export default function BinomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [filters, setFilters] = useState<Filters>({ city: '' });
  const [isCreating, setIsCreating] = useState(false);
  const { usage, canCreate, remaining, isPremium, refetch: refetchQuota } = useSessionQuota();
  const { sessions, mySessions, myParticipations, isLoading, fetchSessions, createSession, joinSession, leaveSession, cancelSession } = useBinomeSessions();

  const isJoinedSession = (sessionId: string) => myParticipations.some(p => p.id === sessionId);

  const handleCreate = async (data: CreateSessionInput) => {
    if (!canCreate) { toast.error(t('binome.quotaReached')); navigate('/premium'); return false; }
    setIsCreating(true);
    const success = await createSession(data);
    setIsCreating(false);
    if (success) { setShowCreateSheet(false); refetchQuota(); }
    return success;
  };
  
  const handleOpenCreate = () => {
    if (!canCreate) { toast.error(t('binome.quotaReachedCreate')); navigate('/premium'); return; }
    setShowCreateSheet(true);
  };

  const handleJoin = async (sessionId: string) => { await joinSession(sessionId); if (filters.city) fetchSessions(filters); };
  const handleLeave = async (sessionId: string) => { await leaveSession(sessionId); if (filters.city) fetchSessions(filters); };
  const handleCancel = async (sessionId: string) => { await cancelSession(sessionId); };
  const handleSearch = () => { if (filters.city) fetchSessions(filters); };

  if (!user) {
    return (
      <PageLayout className="pb-24 safe-bottom">
        <EmptyState icon={Users} title={t('binome.loginRequired')} description={t('binome.loginRequiredDesc')} actionLabel={t('binome.loginAction')} onAction={() => navigate('/')} />
        <BottomNav />
      </PageLayout>
    );
  }

  return (
    <PageLayout className="pb-24 safe-bottom">
      <BinomeOnboarding onComplete={() => {}} />
      <PageHeader
        title={t('binome.title')}
        subtitle={t('binome.subtitle')}
        backTo="/map"
        action={
          <Button size="sm" className="bg-coral hover:bg-coral/90 whitespace-nowrap" onClick={handleOpenCreate} disabled={!canCreate}>
            <Plus className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">{t('create')}</span>
            {!isPremium && remaining < 5 && <span className="ml-1">({remaining})</span>}
          </Button>
        }
      />
        
      <div className="px-6 space-y-4">
        {usage && <SessionQuotaBadge sessionsCreated={usage.sessionsCreated} sessionsLimit={usage.sessionsLimit} isPremium={usage.isPremium} canCreate={usage.canCreate} />}
        
        {!canCreate && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-coral/10 border border-coral/20">
            <Crown className="h-5 w-5 text-coral shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{t('binome.quotaReached')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t('binome.unlockMoreSessions') || 'Passez Premium pour créer des sessions illimitées'}</p>
            </div>
            <Button size="sm" variant="outline" className="border-coral text-coral hover:bg-coral/10 shrink-0" onClick={() => navigate('/premium')}>
              <Crown className="h-3.5 w-3.5 mr-1" />
              Premium
            </Button>
          </div>
        )}
        
        <AIRecommendationsWidget />
        <BinomeDescriptionCard />
        <CommunityStats />

        <button onClick={() => navigate('/binome/history')} className="w-full glass rounded-xl p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-coral/20 text-coral"><History className="h-5 w-5" /></div>
            <span className="font-medium text-foreground">{t('binome.sessionHistory')}</span>
          </div>
          <span className="text-muted-foreground text-sm">→</span>
        </button>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="search" className="flex items-center gap-1"><Calendar className="h-4 w-4" />{t('binome.explore')}</TabsTrigger>
            <TabsTrigger value="my-sessions" className="flex items-center gap-1"><Clock className="h-4 w-4" />{t('binome.mySlots')}</TabsTrigger>
            <TabsTrigger value="joined" className="flex items-center gap-1"><Users className="h-4 w-4" />{t('binome.joined')}</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <SessionFilters filters={filters} onFiltersChange={setFilters} onSearch={handleSearch} isLoading={isLoading} />
            {sessions.length > 0 ? (
              <div className="space-y-4">{sessions.map((session) => <SessionCard key={session.id} session={session} onJoin={handleJoin} onLeave={handleLeave} isJoined={isJoinedSession(session.id)} isLoading={isLoading} />)}</div>
            ) : filters.city ? (
              <div className="space-y-6">
                <EmptyState icon={Calendar} title={t('binome.noSlotsFound')} description={t('binome.noSlotsForCity').replace('{city}', filters.city)} actionLabel={t('binome.createSlot')} onAction={() => setShowCreateSheet(true)} variant="outline" />
                <WhyNearvityCondensed />
              </div>
            ) : (
              <div className="space-y-6">
                <EmptyState icon={Calendar} title={t('binome.searchCity')} description={t('binome.searchCityDesc')} />
                <WhyNearvityCondensed />
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-sessions" className="space-y-4">
            {mySessions.length > 0 ? (
              <div className="space-y-4">{mySessions.map((session) => <SessionCard key={session.id} session={session} onCancel={handleCancel} isOwner={true} isLoading={isLoading} />)}</div>
            ) : (
              <EmptyState icon={Clock} title={t('binome.noCreatedSlots')} description={t('binome.noCreatedSlotsDesc')} actionLabel={t('binome.createFirst')} onAction={() => setShowCreateSheet(true)} />
            )}
          </TabsContent>

          <TabsContent value="joined" className="space-y-4">
            {myParticipations.length > 0 ? (
              <div className="space-y-4">{myParticipations.map((session) => <SessionCard key={session.id} session={session} onLeave={handleLeave} isJoined={true} isLoading={isLoading} />)}</div>
            ) : (
              <EmptyState icon={Users} title={t('binome.noJoinedSessions')} description={t('binome.noJoinedSessionsDesc')} />
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8"><WhyNearvitySection /></div>
        <div className="mt-6"><TestimonialsSection /></div>
      </div>

      <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{t('binome.createSlotTitle')}</SheetTitle>
            <SheetDescription>{t('binome.createSlotDesc')}</SheetDescription>
          </SheetHeader>
          <CreateSessionForm onSubmit={handleCreate} onCancel={() => setShowCreateSheet(false)} isLoading={isCreating} />
        </SheetContent>
      </Sheet>

      <BottomNav />
    </PageLayout>
  );
}
