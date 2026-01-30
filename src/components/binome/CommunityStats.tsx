import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface CommunityStats {
  activeUsersNow: number;
  sessionsThisMonth: number;
  completedSessions: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

export function CommunityStats() {
  const [stats, setStats] = useState<CommunityStats>({
    activeUsersNow: 0,
    sessionsThisMonth: 0,
    completedSessions: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_community_stats');
      
      if (error) {
        console.error('Error fetching community stats:', error);
        return;
      }

      if (data && data.length > 0) {
        setStats({
          activeUsersNow: Number(data[0].active_users_now) || 0,
          sessionsThisMonth: Number(data[0].sessions_this_month) || 0,
          completedSessions: Number(data[0].completed_sessions) || 0
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      icon: <Users className="h-5 w-5 text-signal-green" />,
      value: stats.activeUsersNow,
      label: "En ligne",
      suffix: "maintenant",
      color: "text-signal-green"
    },
    {
      icon: <Calendar className="h-5 w-5 text-coral" />,
      value: stats.sessionsThisMonth,
      label: "Créneaux",
      suffix: "ce mois",
      color: "text-coral"
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      value: stats.completedSessions,
      label: "Rencontres",
      suffix: "réussies",
      color: "text-primary"
    }
  ];

  if (isLoading) {
    return (
      <Card className="bg-muted/30 border-border/50 animate-pulse">
        <CardContent className="p-4">
          <div className="flex items-center justify-around gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 text-center">
                <div className="h-8 bg-muted rounded mb-1" />
                <div className="h-4 bg-muted rounded w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-muted/30 to-background border-border/50 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-coral" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Communauté en temps réel
          </span>
        </div>
        <motion.div 
          className="grid grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {statItems.map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-1">
                {item.icon}
              </div>
              <motion.p 
                className={`text-2xl font-bold ${item.color}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.1, type: "spring" as const, stiffness: 400 }}
              >
                {item.value}
              </motion.p>
              <p className="text-xs text-muted-foreground">
                {item.label}
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                {item.suffix}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
