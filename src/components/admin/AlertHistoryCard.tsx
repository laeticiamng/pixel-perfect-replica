import { useState, useEffect } from 'react';
import { History, Mail, Users, AlertTriangle, Zap, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { Json } from '@/integrations/supabase/types';

interface AlertLog {
  id: string;
  alert_type: string;
  subject: string;
  recipient_email: string;
  sent_at: string;
  metadata: Json;
}

const ALERT_TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  new_user: { icon: Users, color: 'bg-signal-green/20 text-signal-green', label: 'Nouveau' },
  high_reports: { icon: AlertTriangle, color: 'bg-signal-yellow/20 text-signal-yellow', label: 'Signalements' },
  error_spike: { icon: Zap, color: 'bg-coral/20 text-coral', label: 'Erreurs' },
  custom: { icon: Bell, color: 'bg-purple-accent/20 text-purple-accent', label: 'Custom' },
};

export function AlertHistoryCard() {
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('alert_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching alert logs:', error);
      } else {
        setAlerts(data || []);
      }
      setIsLoading(false);
    };

    fetchAlerts();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getAlertConfig = (type: string) => {
    return ALERT_TYPE_CONFIG[type] || ALERT_TYPE_CONFIG.custom;
  };

  if (isLoading) {
    return (
      <Card className="glass border-0">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-0">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-signal-green" />
          Historique des alertes
        </CardTitle>
        <CardDescription>
          Les {alerts.length} dernières alertes envoyées
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucune alerte envoyée</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {alerts.map((alert) => {
                const config = getAlertConfig(alert.alert_type);
                const Icon = config.icon;
                
                return (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(alert.sent_at)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">
                        {alert.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        → {alert.recipient_email}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
