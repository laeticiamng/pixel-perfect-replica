import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { SessionCard } from '@/components/binome/SessionCard';
import { SessionFilters } from '@/components/binome/SessionFilters';
import { CreateSessionForm } from '@/components/binome/CreateSessionForm';
import { SessionQuotaBadge } from '@/components/binome/SessionQuotaBadge';
import { BinomeOnboarding, BinomeDescriptionCard, WhyEasySection, WhyEasyCondensed, TestimonialsSection, CommunityStats } from '@/components/binome';
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Connexion requise</h2>
            <p className="text-muted-foreground mb-4">
              Connecte-toi pour réserver un binôme
            </p>
            <Button onClick={() => navigate('/')} className="bg-coral hover:bg-coral/90">
              Se connecter
            </Button>
          </div>
        </div>
        <BottomNav />
      </PageLayout>
    );
  }

  return (
    <PageLayout className="pb-24 safe-bottom">
      {/* Onboarding dialog for first-time users */}
      <BinomeOnboarding onComplete={() => {}} />

      {/* Header */}
      <header className="safe-top px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/map')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Réserver un Binôme</h1>
              <p className="text-sm text-muted-foreground">Planifie tes sessions</p>
            </div>
          </div>
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
        </div>
        
        {/* Quota Badge */}
        {usage && (
          <SessionQuotaBadge
            sessionsCreated={usage.sessionsCreated}
            sessionsLimit={usage.sessionsLimit}
            isPremium={usage.isPremium}
            canCreate={usage.canCreate}
            className="mt-2"
          />
        )}

        {/* Description Card */}
        <div className="mt-4">
          <BinomeDescriptionCard />
        </div>

        {/* Community Stats */}
        <div className="mt-4">
          <CommunityStats />
        </div>
      </header>

      <div className="px-6">
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
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Aucun créneau trouvé</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Aucune session disponible à {filters.city} pour le moment
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateSheet(true)}
                  >
                    Créer un créneau
                  </Button>
                </div>
                {/* Condensed Why EASY for empty state */}
                <WhyEasyCondensed />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Recherche une ville</h3>
                  <p className="text-sm text-muted-foreground">
                    Entre le nom d'une ville pour voir les créneaux disponibles
                  </p>
                </div>
                {/* Condensed Why EASY for initial state */}
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
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Aucun créneau créé</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tu n'as pas encore créé de créneau
                </p>
                <Button 
                  className="bg-coral hover:bg-coral/90"
                  onClick={() => setShowCreateSheet(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer mon premier créneau
                </Button>
              </div>
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
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Aucune session rejointe</h3>
                <p className="text-sm text-muted-foreground">
                  Explore les créneaux disponibles et rejoins une session !
                </p>
              </div>
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
