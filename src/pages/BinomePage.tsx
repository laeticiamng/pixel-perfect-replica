import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, Clock, History } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BottomNav } from '@/components/BottomNav';
import { PageHeader, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { 
  SessionCard, SessionFilters, CreateSessionForm, SessionQuotaBadge,
  BinomeOnboarding, BinomeDescriptionCard, WhyEasySection, WhyEasyCondensed, 
  TestimonialsSection, CommunityStats, AIRecommendationsWidget 
} from '@/components/binome';
import { useBinomeSessions, type SessionFilters as Filters, type CreateSessionInput } from '@/hooks/useBinomeSessions';
import { useSessionQuota } from '@/hooks/useSessionQuota';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function BinomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [filters, setFilters] = useState<Filters>({ city: '' });
  const [isCreating, setIsCreating] = useState(false);
  
  const { usage, canCreate, remaining, isPremium, refetch: refetchQuota } = useSessionQuota();

  const {
    sessions,
    mySessions,
    myParticipations,
    isLoading,
    fetchSessions,
    createSession,
    joinSession,
    leaveSession,
    cancelSession
  } = useBinomeSessions();

  // Check if user has joined a session
  const isJoinedSession = (sessionId: string) => {
    return myParticipations.some(p => p.id === sessionId);
  };

  // Handle session creation
  const handleCreate = async (data: CreateSessionInput) => {
    if (!canCreate) {
      toast.error('Limite de créneaux atteinte ce mois-ci. Passe Premium pour plus !');
      return false;
    }
    
    setIsCreating(true);
    const success = await createSession(data);
    setIsCreating(false);
    if (success) {
      setShowCreateSheet(false);
      refetchQuota(); // Refresh quota after creation
    }
    return success;
  };
  
  // Handle opening create sheet with quota check
  const handleOpenCreate = () => {
    if (!canCreate) {
      toast.error('Tu as atteint ta limite de 4 créneaux ce mois. Passe Premium !');
      return;
    }
    setShowCreateSheet(true);
  };

  // Handle join
  const handleJoin = async (sessionId: string) => {
    await joinSession(sessionId);
    // Refresh the list after joining
    if (filters.city) {
      fetchSessions(filters);
    }
  };

  // Handle leave
  const handleLeave = async (sessionId: string) => {
    await leaveSession(sessionId);
    if (filters.city) {
      fetchSessions(filters);
    }
  };

  // Handle cancel
  const handleCancel = async (sessionId: string) => {
    await cancelSession(sessionId);
  };

  // Handle search
  const handleSearch = () => {
    if (filters.city) {
      fetchSessions(filters);
    }
  };

  if (!user) {
    return (
      <PageLayout className="pb-24 safe-bottom">
        <EmptyState
          icon={Users}
          title="Connexion requise"
          description="Connecte-toi pour réserver un binôme"
          actionLabel="Se connecter"
          onAction={() => navigate('/')}
        />
        <BottomNav />
      </PageLayout>
    );
  }

  return (
    <PageLayout className="pb-24 safe-bottom">
      {/* Onboarding dialog for first-time users */}
      <BinomeOnboarding onComplete={() => {}} />

      {/* Header */}
      <PageHeader
        title="Réserver un Binôme"
        subtitle="Planifie tes sessions"
        backTo="/map"
        action={
          <Button 
            size="sm" 
            className="bg-coral hover:bg-coral/90 whitespace-nowrap"
            onClick={handleOpenCreate}
            disabled={!canCreate}
          >
            <Plus className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Créer</span>
            {!isPremium && remaining < 5 && <span className="ml-1">({remaining})</span>}
          </Button>
        }
      />
        
      <div className="px-6 space-y-4">
        {/* Quota Badge */}
        {usage && (
          <SessionQuotaBadge
            sessionsCreated={usage.sessionsCreated}
            sessionsLimit={usage.sessionsLimit}
            isPremium={usage.isPremium}
            canCreate={usage.canCreate}
          />
        )}

        {/* AI Recommendations */}
        <AIRecommendationsWidget />

        {/* Description Card */}
        <BinomeDescriptionCard />

        {/* Community Stats */}
        <CommunityStats />

        {/* History Link */}
        <button
          onClick={() => navigate('/binome/history')}
          className="w-full glass rounded-xl p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-coral/20 text-coral">
              <History className="h-5 w-5" />
            </div>
            <span className="font-medium text-foreground">Historique des sessions</span>
          </div>
          <span className="text-muted-foreground text-sm">→</span>
        </button>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="search" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Explorer
            </TabsTrigger>
            <TabsTrigger value="my-sessions" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Mes créneaux
            </TabsTrigger>
            <TabsTrigger value="joined" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Rejoints
            </TabsTrigger>
          </TabsList>

          {/* Search / Explore Tab */}
          <TabsContent value="search" className="space-y-4">
            <SessionFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
              isLoading={isLoading}
            />

            {sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                    isJoined={isJoinedSession(session.id)}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            ) : filters.city ? (
              <div className="space-y-6">
                <EmptyState
                  icon={Calendar}
                  title="Aucun créneau trouvé"
                  description={`Aucune session disponible à ${filters.city} pour le moment`}
                  actionLabel="Créer un créneau"
                  onAction={() => setShowCreateSheet(true)}
                  variant="outline"
                />
                <WhyEasyCondensed />
              </div>
            ) : (
              <div className="space-y-6">
                <EmptyState
                  icon={Calendar}
                  title="Recherche une ville"
                  description="Entre le nom d'une ville pour voir les créneaux disponibles"
                />
                <WhyEasyCondensed />
              </div>
            )}
          </TabsContent>

          {/* My Sessions Tab */}
          <TabsContent value="my-sessions" className="space-y-4">
            {mySessions.length > 0 ? (
              <div className="space-y-4">
                {mySessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onCancel={handleCancel}
                    isOwner={true}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Clock}
                title="Aucun créneau créé"
                description="Tu n'as pas encore créé de créneau"
                actionLabel="Créer mon premier créneau"
                onAction={() => setShowCreateSheet(true)}
              />
            )}
          </TabsContent>

          {/* Joined Sessions Tab */}
          <TabsContent value="joined" className="space-y-4">
            {myParticipations.length > 0 ? (
              <div className="space-y-4">
                {myParticipations.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onLeave={handleLeave}
                    isJoined={true}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="Aucune session rejointe"
                description="Explore les créneaux disponibles et rejoins une session !"
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Why EASY Section */}
        {/* Why EASY Section */}
        <div className="mt-8">
          <WhyEasySection />
        </div>

        {/* Testimonials Section */}
        <div className="mt-6">
          <TestimonialsSection />
        </div>
      </div>

      {/* Create Session Sheet */}
      <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Créer un créneau</SheetTitle>
            <SheetDescription>
              Planifie une session avec d'autres personnes dans ta ville
            </SheetDescription>
          </SheetHeader>
          <CreateSessionForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateSheet(false)}
            isLoading={isCreating}
          />
        </SheetContent>
      </Sheet>

      <BottomNav />
    </PageLayout>
  );
}
