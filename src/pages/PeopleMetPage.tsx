import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Search, Calendar, TrendingUp, Filter } from 'lucide-react';
import { useInteractions } from '@/hooks/useInteractions';
import { ACTIVITIES } from '@/types/signal';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/PageLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProfileCardSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface MetPerson {
  id: string;
  firstName: string;
  activity: string;
  date: Date;
  positive: boolean | null;
}

export default function PeopleMetPage() {
  const navigate = useNavigate();
  const { getMyInteractions } = useInteractions();
  const [peopleMet, setPeopleMet] = useState<MetPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFeedback, setFilterFeedback] = useState<'all' | 'positive' | 'negative' | 'pending'>('all');

  useEffect(() => {
    const loadPeople = async () => {
      const { data } = await getMyInteractions(50);
      
      if (data) {
        const people = data.map(interaction => ({
          id: interaction.id,
          firstName: interaction.target_profile?.first_name || 'Anonyme',
          activity: interaction.activity,
          date: new Date(interaction.created_at),
          positive: interaction.feedback === 'positive' ? true : 
                   interaction.feedback === 'negative' ? false : null,
        }));
        setPeopleMet(people);
      }
      setIsLoading(false);
    };
    
    loadPeople();
  }, [getMyInteractions]);

  const filteredPeople = useMemo(() => {
    return peopleMet.filter(person => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        person.firstName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Feedback filter
      const matchesFeedback = filterFeedback === 'all' ||
        (filterFeedback === 'positive' && person.positive === true) ||
        (filterFeedback === 'negative' && person.positive === false) ||
        (filterFeedback === 'pending' && person.positive === null);
      
      return matchesSearch && matchesFeedback;
    });
  }, [peopleMet, searchQuery, filterFeedback]);

  const stats = useMemo(() => {
    const positive = peopleMet.filter(p => p.positive === true).length;
    const negative = peopleMet.filter(p => p.positive === false).length;
    const pending = peopleMet.filter(p => p.positive === null).length;
    return { positive, negative, pending, total: peopleMet.length };
  }, [peopleMet]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getActivityData = (activityId: string) => {
    return ACTIVITIES.find(a => a.id === activityId) || { emoji: '✨', label: 'Autre' };
  };

  if (isLoading) {
    return (
      <PageLayout className="pb-8 safe-bottom">
        <header className="safe-top px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Personnes rencontrées</h1>
        </header>
        <div className="px-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="pb-8 safe-bottom">
      {/* Header */}
      <header className="safe-top px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Personnes rencontrées</h1>
        </div>
        <Breadcrumbs className="px-2" />
      </header>

      <div className="px-6 space-y-4">
        {/* Stats Summary */}
        {peopleMet.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-signal-green">{stats.positive}</p>
              <p className="text-xs text-muted-foreground">😊</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-signal-red">{stats.negative}</p>
              <p className="text-xs text-muted-foreground">😕</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-muted-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">❓</p>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        {peopleMet.length > 0 && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par prénom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'positive', 'negative', 'pending'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setFilterFeedback(filter)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    filterFeedback === filter
                      ? 'bg-coral text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {filter === 'all' ? 'Tous' : 
                   filter === 'positive' ? '😊' :
                   filter === 'negative' ? '😕' : '❓'}
                </button>
              ))}
            </div>
          </>
        )}

        {/* People List */}
        {filteredPeople.length === 0 && peopleMet.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-coral/20 blur-xl animate-breathing" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-coral/20 to-coral/10 flex items-center justify-center relative">
                <UserCircle className="h-12 w-12 text-coral" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucune rencontre pour l'instant</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-xs">
              Active ton signal sur la carte et va à la rencontre de nouvelles personnes !
            </p>
            <button
              onClick={() => navigate('/map')}
              className="px-6 py-3 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 glow-coral"
            >
              Activer mon signal
            </button>
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Aucun résultat pour ces filtres
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPeople.map((person) => {
              const activityData = getActivityData(person.activity);
              return (
                  <button
                    key={person.id}
                    onClick={() => {
                      // Try to navigate to reveal if user still has active signal
                      toast('Ce profil n\'est plus actif. Les interactions sont éphémères !', { icon: '👻' });
                    }}
                    className="w-full glass rounded-xl p-4 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors"
                    aria-label={`Voir le profil de ${person.firstName}`}
                  >
                  <div className="w-12 h-12 rounded-full bg-coral flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-foreground">
                      {person.firstName.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{person.firstName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{activityData.emoji} {activityData.label}</span>
                      <span>•</span>
                      <span>{formatDate(person.date)}</span>
                    </div>
                  </div>
                  
                  <span className="text-2xl" aria-label={person.positive === true ? 'Feedback positif' : person.positive === false ? 'Feedback négatif' : 'Pas de feedback'}>
                    {person.positive === true ? '😊' : person.positive === false ? '😕' : '❓'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
