import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, QrCode, Plus, Loader2, Filter, Heart, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/PageLayout';
import { BottomNav } from '@/components/BottomNav';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { 
  RecurrenceSelector, type RecurrenceType, 
  EventCategorySelector, EventCategoryBadge, type EventCategory,
  EventFavoriteButton
} from '@/components/events';
import { useEvents, Event } from '@/hooks/useEvents';
import { useEventFavorites } from '@/hooks/useEventFavorites';
import { useLocationStore } from '@/stores/locationStore';
import { useTranslation } from '@/lib/i18n';
import { format, addHours, addWeeks, addMonths } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function EventsPage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { events, myEvents, isLoading, createEvent, joinEvent, leaveEvent, isParticipating } = useEvents();
  const { isFavorite, toggleFavorite, isLoading: isFavLoading } = useEventFavorites();
  const { position } = useLocationStore();
  
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [duration, setDuration] = useState(2); // hours
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [occurrences, setOccurrences] = useState(4);
  const [category, setCategory] = useState<EventCategory | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const dateLocale = locale === 'fr' ? fr : enUS;

  const handleCreateEvent = async () => {
    if (!name.trim() || !locationName.trim() || !startsAt) {
      toast.error(t('events.fillRequired'));
      return;
    }

    if (!position) {
      toast.error(t('events.gpsRequired'));
      return;
    }

    setIsCreating(true);
    
    // Calculate dates to create
    const datesToCreate: { startDate: Date; endDate: Date }[] = [];
    const baseStartDate = new Date(startsAt);
    
    if (recurrence === 'none') {
      datesToCreate.push({
        startDate: baseStartDate,
        endDate: addHours(baseStartDate, duration),
      });
    } else {
      for (let i = 0; i < occurrences; i++) {
        const startDate = recurrence === 'weekly'
          ? addWeeks(baseStartDate, i)
          : addMonths(baseStartDate, i);
        datesToCreate.push({
          startDate,
          endDate: addHours(startDate, duration),
        });
      }
    }

    let successCount = 0;
    let hasError = false;

    for (const { startDate, endDate } of datesToCreate) {
      // Include category tag in description for filtering
      const descWithCategory = category 
        ? `[${category}] ${description.trim() || ''}`
        : description.trim() || undefined;
        
      const { error } = await createEvent({
        name: name.trim(),
        description: descWithCategory,
        location_name: locationName.trim(),
        latitude: position.latitude,
        longitude: position.longitude,
        starts_at: startDate,
        ends_at: endDate,
      });

      if (error) {
        hasError = true;
      } else {
        successCount++;
      }
    }

    setIsCreating(false);

    if (hasError && successCount === 0) {
      toast.error(t('events.createError'));
    } else if (hasError) {
      toast.success(t('eventsExtra.someEventsFailed').replace('{count}', String(successCount)));
      setShowCreate(false);
      resetForm();
      toast.success(
        recurrence === 'none'
          ? t('events.eventCreated')
          : t('eventsExtra.multipleEventsCreated').replace('{count}', String(successCount))
      );
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
    setRecurrence('none');
    setOccurrences(4);
    setCategory(null);
  };

  // Filter events by category
  const filteredEvents = categoryFilter
    ? events.filter(e => e.description?.includes(`[${categoryFilter}]`))
    : events;

  const handleJoinEvent = async (eventId: string) => {
    const { error } = await joinEvent(eventId);
    if (error) {
      toast.error(t('events.joinError'));
    } else {
      toast.success(t('events.joined'));
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    const { error } = await leaveEvent(eventId);
    if (error) {
      toast.error(t('events.leaveError'));
    } else {
      toast.success(t('events.left'));
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
          <div className="flex items-center gap-2">
            <EventFavoriteButton
              eventId={event.id}
              isFavorite={isFavorite(event.id)}
              onToggle={toggleFavorite}
              disabled={isFavLoading}
            />
            {isJoined && (
              <span className="text-xs bg-signal-green/20 text-signal-green px-2 py-1 rounded-full">
                {t('events.registered')} ✓
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(event.starts_at), locale === 'fr' ? 'PPP à HH:mm' : "PPP 'at' HH:mm", { locale: dateLocale })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{t('events.max')} {event.max_participants}</span>
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
                {t('events.viewQrCode')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLeaveEvent(event.id)}
                className="text-destructive"
              >
                {t('events.leave')}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => handleJoinEvent(event.id)}
              className="w-full bg-coral hover:bg-coral-dark"
            >
              {t('events.join')}
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
            aria-label={t('events.backToMap')}
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('events.title')}</h1>
        </div>
        <Breadcrumbs className="px-2" />
      </header>

      <div className="px-6 space-y-6">
        {/* Filters and Create Button */}
        <div className="flex gap-2">
          {!showCreate && (
            <Button
              onClick={() => setShowCreate(true)}
              className="flex-1 h-14 bg-coral hover:bg-coral-dark rounded-xl gap-2"
            >
              <Plus className="h-5 w-5" />
              {t('events.createEvent')}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/events/favorites')}
            className="h-14 rounded-xl"
            aria-label={t('favoriteEvents.myFavorites')}
          >
            <Heart className="h-5 w-5 text-coral" />
          </Button>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className={`h-14 rounded-xl ${showFilters ? 'bg-coral hover:bg-coral-dark' : ''}`}
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {/* Category Filters */}
        {showFilters && (
          <div className="glass rounded-xl p-4 space-y-3 animate-slide-up">
            <p className="text-sm font-medium text-muted-foreground">
              {t('eventsExtra.filterByCategory')}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !categoryFilter ? 'bg-coral text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t('eventsExtra.allCategories')}
              </button>
              {(['social', 'academic', 'sport', 'culture', 'party', 'professional', 'other'] as EventCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                  className={`transition-all ${categoryFilter === cat ? 'ring-2 ring-coral' : ''}`}
                >
                  <EventCategoryBadge category={cat} size="sm" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create Event Form */}
        {showCreate && (
          <Card className="glass border-0 animate-slide-up">
            <CardHeader>
              <CardTitle>{t('events.newEvent')}</CardTitle>
              <CardDescription>{t('events.newEventDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('events.name')} *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 100))}
                  placeholder={t('eventsExtra.namePlaceholder')}
                  className="bg-muted border-border rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('events.location')} *</label>
                <Input
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value.slice(0, 200))}
                  placeholder={t('eventsExtra.locationPlaceholder')}
                  className="bg-muted border-border rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('events.description')}</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  placeholder={t('events.describeEvent')}
                  className="bg-muted border-border rounded-xl min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('events.start')} *</label>
                  <Input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="bg-muted border-border rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('events.durationHours')}</label>
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

              {/* Category Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('eventsExtra.category')}</label>
                <EventCategorySelector value={category} onChange={setCategory} />
              </div>

              {/* Recurrence Selector */}
              <RecurrenceSelector
                value={recurrence}
                onChange={setRecurrence}
                occurrences={occurrences}
                onOccurrencesChange={setOccurrences}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-xl"
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  disabled={isCreating}
                  className="flex-1 bg-coral hover:bg-coral-dark rounded-xl"
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('create')
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
              <MapPin className="h-5 w-5 text-coral" /> {t('events.myEvents')}
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
            <PartyPopper className="h-5 w-5 text-signal-green" /> {t('events.upcomingEvents')}
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-4xl mb-4">📅</p>
              <p className="text-foreground font-medium mb-2">
                {categoryFilter ? t('eventsExtra.noEventsInCategory') : t('eventsExtra.noUpcomingEvents')}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                {t('eventsExtra.createFirstOrComeBack')}
              </p>
              {categoryFilter && (
                <Button variant="link" onClick={() => setCategoryFilter(null)} className="mt-2 text-coral">
                  {t('eventsExtra.seeAllEvents')}
                </Button>
              )}
            </div>
          ) : (
            filteredEvents
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

      <BottomNav />
    </PageLayout>
  );
}
