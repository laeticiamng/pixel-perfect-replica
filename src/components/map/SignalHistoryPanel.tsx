import { useState, useEffect } from 'react';
import { History, Clock, MapPin, Radio } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState, LoadingSkeleton } from '@/components/shared';

interface SignalHistoryEntry {
  id: string;
  activity: string;
  started_at: string;
  expires_at: string;
  location_description?: string;
}

const activityLabels: Record<string, string> = {
  studying: 'Réviser',
  eating: 'Manger',
  working: 'Bosser',
  talking: 'Parler',
  sport: 'Sport',
  other: 'Autre'
};

const activityEmojis: Record<string, string> = {
  studying: '📚',
  eating: '🍽️',
  working: '💻',
  talking: '💬',
  sport: '🏃',
  other: '✨'
};

export function SignalHistoryPanel() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<SignalHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      loadHistory();
    }
  }, [open, user]);

  const loadHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Note: We're using analytics_events to track signal history
      // since active_signals only contains current signals
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_name', 'signal_activated')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const entries: SignalHistoryEntry[] = (data || []).map(event => ({
        id: event.id,
        activity: (event.event_data as any)?.activity || 'other',
        started_at: event.created_at,
        expires_at: new Date(new Date(event.created_at).getTime() + 2 * 60 * 60 * 1000).toISOString(),
        location_description: (event.event_data as any)?.location_description
      }));

      setHistory(entries);
    } catch (err) {
      console.error('Error loading signal history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <History className="h-4 w-4" />
          Historique
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-coral" />
            Historique des signaux
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
          {isLoading ? (
            <LoadingSkeleton variant="card" count={4} />
          ) : history.length === 0 ? (
            <EmptyState
              icon={History}
              title="Aucun historique"
              description="Tes signaux passés apparaîtront ici"
            />
          ) : (
            <div className="space-y-3">
              {history.map(entry => (
                <div
                  key={entry.id}
                  className="glass rounded-xl p-4 border border-border/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activityEmojis[entry.activity]}</span>
                      <div>
                        <p className="font-medium text-foreground">
                          {activityLabels[entry.activity] || entry.activity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.started_at), 'EEEE d MMMM', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formatDistanceToNow(new Date(entry.started_at), { 
                        addSuffix: true,
                        locale: fr 
                      })}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(entry.started_at), 'HH:mm')} - 
                      {format(new Date(entry.expires_at), 'HH:mm')}
                    </span>
                    {entry.location_description && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {entry.location_description}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <p className="text-xs text-center text-muted-foreground py-4">
                Affichage des 20 derniers signaux
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
