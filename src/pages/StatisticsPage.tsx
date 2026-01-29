import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Clock, Users, Star, Calendar, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInteractions } from '@/hooks/useInteractions';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from 'recharts';

interface InteractionData {
  activity: string;
  count: number;
  emoji: string;
}

interface WeeklyData {
  day: string;
  interactions: number;
}

interface HourlyData {
  hour: string;
  count: number;
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

const CHART_COLORS = [
  'hsl(16, 100%, 66%)', // coral
  'hsl(142, 76%, 36%)', // green
  'hsl(48, 96%, 53%)',  // yellow
  'hsl(262, 83%, 58%)', // purple
  'hsl(200, 100%, 50%)', // blue
  'hsl(340, 82%, 52%)', // pink
];

export default function StatisticsPage() {
  const navigate = useNavigate();
  const { stats } = useAuth();
  const { getMyInteractions } = useInteractions();
  const [topActivities, setTopActivities] = useState<InteractionData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([
    { day: 'Lun', interactions: 0 },
    { day: 'Mar', interactions: 0 },
    { day: 'Mer', interactions: 0 },
    { day: 'Jeu', interactions: 0 },
    { day: 'Ven', interactions: 0 },
    { day: 'Sam', interactions: 0 },
    { day: 'Dim', interactions: 0 },
  ]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      const { data: interactions } = await getMyInteractions(100);
      
      if (interactions) {
        // Count activities
        const activityCounts: Record<string, number> = {};
        const dayCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        const hourCounts: Record<number, number> = {};
        
        // Initialize hour counts
        for (let h = 6; h <= 23; h++) {
          hourCounts[h] = 0;
        }
        
        interactions.forEach(interaction => {
          // Activity counts
          activityCounts[interaction.activity] = (activityCounts[interaction.activity] || 0) + 1;
          
          // Weekly counts
          const date = new Date(interaction.created_at);
          const dayOfWeek = date.getDay();
          const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
          dayCounts[adjustedDay]++;
          
          // Hourly counts
          const hour = date.getHours();
          if (hour >= 6 && hour <= 23) {
            hourCounts[hour]++;
          }
        });
        
        // Convert to array and sort
        const sortedActivities = Object.entries(activityCounts)
          .map(([activity, count]) => ({
            activity: ACTIVITY_LABELS[activity] || activity,
            count,
            emoji: ACTIVITY_EMOJIS[activity] || '✨',
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        setTopActivities(sortedActivities);
        
        // Pie chart data
        const pieChartData = sortedActivities.slice(0, 5).map((item, index) => ({
          name: item.activity,
          value: item.count,
          color: CHART_COLORS[index % CHART_COLORS.length],
        }));
        setPieData(pieChartData);
        
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
        
        // Hourly data
        const hourlyChartData = Object.entries(hourCounts)
          .map(([hour, count]) => ({
            hour: `${hour}h`,
            count,
          }))
          .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
        setHourlyData(hourlyChartData);
      }
    };
    
    loadStats();
  }, [getMyInteractions]);

  const weekTotal = weeklyData.reduce((sum, d) => sum + d.interactions, 0);
  const avgPerDay = (weekTotal / 7).toFixed(1);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg px-3 py-2 text-sm">
          <p className="text-foreground font-semibold">{label}</p>
          <p className="text-coral">{payload[0].value} interactions</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-radial pb-8 safe-bottom">
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
              <span className="text-sm text-muted-foreground">Moyenne/jour</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {avgPerDay}
            </p>
          </div>
        </div>

        {/* Weekly Chart with Recharts */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-coral" />
              <h2 className="font-semibold text-foreground">Cette semaine</h2>
            </div>
            <span className="text-2xl font-bold text-coral">{weekTotal}</span>
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(240 5% 64.9%)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(240 5% 64.9%)', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(240 33% 14% / 0.5)' }} />
                <Bar 
                  dataKey="interactions" 
                  radius={[6, 6, 0, 0]}
                  fill="hsl(16, 100%, 66%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Breakdown Pie Chart */}
        {pieData.length > 0 && (
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-coral" />
              <h2 className="font-semibold text-foreground">Répartition par activité</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={50}
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 space-y-2">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-foreground flex-1">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Activities */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-signal-yellow" />
            <h2 className="font-semibold text-foreground">Top activités</h2>
          </div>
          
          {topActivities.length > 0 ? (
            <div className="space-y-4">
              {topActivities.map((activity, index) => (
                <div key={activity.activity} className="flex items-center gap-4">
                  <span className="text-2xl w-8 text-center font-bold text-coral">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                  </span>
                  <div className="w-12 h-12 rounded-lg bg-deep-blue-light flex items-center justify-center text-2xl">
                    {activity.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.activity}</p>
                    <div className="w-full bg-muted/30 rounded-full h-2 mt-1">
                      <div 
                        className="bg-coral rounded-full h-2 transition-all duration-500"
                        style={{ width: `${(activity.count / topActivities[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {activity.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Pas encore d'interactions. Commence à rencontrer du monde !
            </p>
          )}
        </div>

        {/* Hourly Heatmap */}
        <div className="glass rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Heures les plus actives</h2>
          
          {hourlyData.length > 0 && hourlyData.some(h => h.count > 0) ? (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(240 5% 64.9%)', fontSize: 10 }}
                    interval={2}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(240 33% 14% / 0.5)' }} />
                  <Bar 
                    dataKey="count" 
                    radius={[4, 4, 0, 0]}
                    fill="hsl(48, 96%, 53%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {['8h', '10h', '12h', '14h', '16h', '18h'].map((hour) => (
                <div
                  key={hour}
                  className="aspect-square rounded-lg flex items-center justify-center text-xs bg-muted/20 text-muted-foreground"
                >
                  {hour}
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Basé sur tes 100 dernières interactions
          </p>
        </div>
      </div>
    </div>
  );
}
