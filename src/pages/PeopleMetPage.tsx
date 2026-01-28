import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle } from 'lucide-react';
import { useInteractions } from '@/hooks/useInteractions';
import { ACTIVITIES } from '@/types/signal';
import { Loader2 } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-radial pb-8">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Personnes rencontrées</h1>
      </header>

      <div className="px-6">
        {peopleMet.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <UserCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Tu n'as pas encore rencontré de personnes.
              <br />
              Active ton signal et va à la rencontre !
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {peopleMet.map((person) => {
              const activityData = getActivityData(person.activity);
              return (
                <div
                  key={person.id}
                  className="glass rounded-xl p-4 flex items-center gap-4"
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
                  
                  <span className="text-2xl">
                    {person.positive === true ? '😊' : person.positive === false ? '😕' : '❓'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
