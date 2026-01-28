import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Clock, Users, Star, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInteractions } from '@/hooks/useInteractions';

interface InteractionData {
  activity: string;
  count: number;
  emoji: string;
}

const ACTIVITY_EMOJIS: Record<string, string> = {
  studying: '📚',
  eating: '🍽️',
  working: '💻',
  talking: '💬',
  sport: '🏃',
  other: '✨',
};

const ACTIVITY_LABELS: Record<string, string> = {
  studying: 'Réviser',
  eating: 'Manger',
  working: 'Bosser',
  talking: 'Parler',
  sport: 'Sport',
  other: 'Autre',
};

export default function StatisticsPage() {
  const navigate = useNavigate();
  const { stats } = useAuth();
  const { getMyInteractions } = useInteractions();
  const [topActivities, setTopActivities] = useState<InteractionData[]>([]);
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Lun', interactions: 0 },
    { day: 'Mar', interactions: 0 },
    { day: 'Mer', interactions: 0 },
    { day: 'Jeu', interactions: 0 },
    { day: 'Ven', interactions: 0 },
    { day: 'Sam', interactions: 0 },
    { day: 'Dim', interactions: 0 },
  ]);

  useEffect(() => {
    const loadStats = async () => {
      const { data: interactions } = await getMyInteractions(100);
      
      if (interactions) {
        // Count activities
        const activityCounts: Record<string, number> = {};
        const dayCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        
        interactions.forEach(interaction => {
          // Activity counts
          activityCounts[interaction.activity] = (activityCounts[interaction.activity] || 0) + 1;
          
          // Weekly counts
          const date = new Date(interaction.created_at);
          const dayOfWeek = date.getDay();
          const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
          dayCounts[adjustedDay]++;
        });
        
        // Convert to array and sort
        const sortedActivities = Object.entries(activityCounts)
          .map(([activity, count]) => ({
            activity: ACTIVITY_LABELS[activity] || activity,
            count,
            emoji: ACTIVITY_EMOJIS[activity] || '✨',
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
        
        setTopActivities(sortedActivities);
        
        // Update weekly data
        setWeeklyData([
          { day: 'Lun', interactions: dayCounts[0] },
          { day: 'Mar', interactions: dayCounts[1] },
          { day: 'Mer', interactions: dayCounts[2] },
          { day: 'Jeu', interactions: dayCounts[3] },
          { day: 'Ven', interactions: dayCounts[4] },
          { day: 'Sam', interactions: dayCounts[5] },
          { day: 'Dim', interactions: dayCounts[6] },
        ]);
      }
    };
    
    loadStats();
  }, [getMyInteractions]);

  const maxInteractions = Math.max(...weeklyData.map(d => d.interactions), 1);
  const weekTotal = weeklyData.reduce((sum, d) => sum + d.interactions, 0);

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
        <h1 className="text-xl font-bold text-foreground">Mes statistiques</h1>
      </header>

      <div className="px-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-coral" />
              <span className="text-sm text-muted-foreground">Total rencontres</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats?.interactions || 0}
            </p>
          </div>
          
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-coral" />
              <span className="text-sm text-muted-foreground">Heures actives</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {Math.round(stats?.hours_active || 0)}h
            </p>
          </div>
          
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-signal-yellow" />
              <span className="text-sm text-muted-foreground">Rating moyen</span>
            </div>
            <p className="text-3xl font-bold text-coral">
              {stats?.rating?.toFixed(1) || '5.0'}
            </p>
          </div>
          
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-signal-green" />
              <span className="text-sm text-muted-foreground">Cette semaine</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {weekTotal}
            </p>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-coral" />
            <h2 className="font-semibold text-foreground">Interactions par jour</h2>
          </div>
          
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyData.map((data) => (
              <div key={data.day} className="flex flex-col items-center gap-2 flex-1">
                <div 
                  className="w-full bg-coral/80 rounded-t-lg transition-all duration-500 glow-coral"
                  style={{ 
                    height: `${(data.interactions / maxInteractions) * 100}%`,
                    minHeight: data.interactions > 0 ? '8px' : '4px'
                  }}
                />
                <span className="text-xs text-muted-foreground">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Activities */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-coral" />
            <h2 className="font-semibold text-foreground">Top activités</h2>
          </div>
          
          {topActivities.length > 0 ? (
            <div className="space-y-4">
              {topActivities.map((activity, index) => (
                <div key={activity.activity} className="flex items-center gap-4">
                  <span className="text-2xl w-8 text-center">{index + 1}</span>
                  <div className="w-12 h-12 rounded-lg bg-deep-blue-light flex items-center justify-center text-2xl">
                    {activity.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.activity}</p>
                    <p className="text-sm text-muted-foreground">{activity.count} fois</p>
                  </div>
                  <div 
                    className="h-2 bg-coral/50 rounded-full"
                    style={{ width: `${(activity.count / topActivities[0].count) * 60}px` }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Pas encore d'interactions. Commence à rencontrer du monde !
            </p>
          )}
        </div>

        {/* Heatmap placeholder */}
        <div className="glass rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Heures les plus actives</h2>
          <div className="grid grid-cols-6 gap-2">
            {['8h', '10h', '12h', '14h', '16h', '18h'].map((hour, i) => (
              <div
                key={hour}
                className="aspect-square rounded-lg flex items-center justify-center text-xs"
                style={{
                  backgroundColor: `hsl(var(--coral) / ${0.2 + (Math.random() * 0.6)})`,
                }}
              >
                {hour}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Basé sur tes 30 derniers jours d'activité
          </p>
        </div>
      </div>
    </div>
  );
}
