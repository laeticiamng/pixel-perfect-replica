import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, QrCode, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/PageLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useEvents, Event } from '@/hooks/useEvents';
import { useLocationStore } from '@/stores/locationStore';
import { cn } from '@/lib/utils';
import { format, addHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function EventsPage() {
  const navigate = useNavigate();
  const { events, myEvents, joinedEvents, isLoading, createEvent, joinEvent, leaveEvent, isParticipating } = useEvents();
  const { position } = useLocationStore();
  
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [duration, setDuration] = useState(2); // hours

  const handleCreateEvent = async () => {
    if (!name.trim() || !locationName.trim() || !startsAt) {
      toast.error('Remplis tous les champs obligatoires');
      return;
    }

    if (!position) {
      toast.error('Position GPS requise');
      return;
    }

    setIsCreating(true);
    const startDate = new Date(startsAt);
    const endDate = addHours(startDate, duration);

    const { error } = await createEvent({
      name: name.trim(),
      description: description.trim() || undefined,
      location_name: locationName.trim(),
      latitude: position.latitude,
      longitude: position.longitude,
      starts_at: startDate,
      ends_at: endDate,
    });

    setIsCreating(false);

    if (error) {
      toast.error('Erreur lors de la création');
    } else {
      toast.success('Événement créé !');
      setShowCreate(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setLocationName('');
    setStartsAt('');
    setDuration(2);
  };

  const handleJoinEvent = async (eventId: string) => {
    const { error } = await joinEvent(eventId);
    if (error) {
      toast.error('Erreur lors de l\'inscription');
    } else {
      toast.success('Inscrit à l\'événement !');
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    const { error } = await leaveEvent(eventId);
    if (error) {
      toast.error('Erreur lors de la désinscription');
    } else {
      toast.success('Désinscrit de l\'événement');
    }
  };

  const EventCard = ({ event, isJoined }: { event: Event; isJoined: boolean }) => (
    <Card className="glass border-0 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{event.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {event.location_name}
            </CardDescription>
          </div>
          {isJoined && (
            <span className="text-xs bg-signal-green/20 text-signal-green px-2 py-1 rounded-full">
              Inscrit ✓
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(event.starts_at), 'PPP à HH:mm', { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Max {event.max_participants}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {isJoined ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/events/${event.id}`)}
                className="flex-1"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Voir QR Code
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLeaveEvent(event.id)}
                className="text-destructive"
              >
                Quitter
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => handleJoinEvent(event.id)}
              className="w-full bg-coral hover:bg-coral-dark"
            >
              Rejoindre
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout className="pb-24 safe-bottom">
      <header className="safe-top px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate('/map')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Retour à la carte"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Événements</h1>
        </div>
        <Breadcrumbs className="px-2" />
      </header>

      <div className="px-6 space-y-6">
        {/* Create Event Button */}
        {!showCreate && (
          <Button
            onClick={() => setShowCreate(true)}
            className="w-full h-14 bg-coral hover:bg-coral-dark rounded-xl gap-2"
          >
            <Plus className="h-5 w-5" />
            Créer un événement
          </Button>
        )}

        {/* Create Event Form */}
        {showCreate && (
          <Card className="glass border-0 animate-slide-up">
            <CardHeader>
              <CardTitle>Nouvel événement</CardTitle>
              <CardDescription>Crée un événement avec signal isolé</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 100))}
                  placeholder="Soirée de lancement..."
                  className="bg-muted border-border rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lieu *</label>
                <Input
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value.slice(0, 200))}
                  placeholder="Café Central, BU..."
                  className="bg-muted border-border rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  placeholder="Décris ton événement..."
                  className="bg-muted border-border rounded-xl min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Début *</label>
                  <Input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="bg-muted border-border rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Durée (h)</label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="bg-muted border-border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  disabled={isCreating}
                  className="flex-1 bg-coral hover:bg-coral-dark rounded-xl"
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Créer'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Events */}
        {myEvents.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="text-coral">📍</span> Mes événements
            </h2>
            {myEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                isJoined={isParticipating(event.id)} 
              />
            ))}
          </div>
        )}

        {/* All Events */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-signal-green">🎉</span> Événements à venir
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">📅</p>
              <p className="text-muted-foreground">Aucun événement pour le moment</p>
              <p className="text-sm text-muted-foreground mt-1">Crée le premier !</p>
            </div>
          ) : (
            events
              .filter(e => !myEvents.some(me => me.id === e.id))
              .map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isJoined={isParticipating(event.id)} 
                />
              ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}
