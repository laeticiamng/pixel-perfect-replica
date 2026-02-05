 import { useState, useEffect } from "react";
 import { useNavigate, Link } from "react-router-dom";
 import { ArrowLeft, Heart, Calendar, MapPin, Clock, Users, Sparkles } from "lucide-react";
 import { format } from "date-fns";
 import { fr } from "date-fns/locale";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { useEventFavorites } from "@/hooks/useEventFavorites";
 import { PageLayout } from "@/components/PageLayout";
 import { Card, CardContent } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Skeleton } from "@/components/ui/skeleton";
 import { EventFavoriteButton } from "@/components/events/EventFavoriteButton";
 import { EmptyState } from "@/components/shared/EmptyState";
 
 interface Event {
   id: string;
   name: string;
   description: string | null;
   location_name: string;
   starts_at: string;
   ends_at: string;
   max_participants: number | null;
   is_active: boolean;
 }
 
 export default function FavoriteEventsPage() {
   const navigate = useNavigate();
   const { user } = useAuth();
   const { favorites, isFavorite, toggleFavorite, isLoading: favLoading } = useEventFavorites();
   const [events, setEvents] = useState<Event[]>([]);
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     async function fetchFavoriteEvents() {
       if (!user || favorites.length === 0) {
         setEvents([]);
         setIsLoading(false);
         return;
       }
 
       try {
         const { data, error } = await supabase
           .from("events")
           .select("id, name, description, location_name, starts_at, ends_at, max_participants, is_active")
           .in("id", favorites)
           .order("starts_at", { ascending: true });
 
         if (error) throw error;
         setEvents(data || []);
       } catch (err) {
         console.error("Error fetching favorite events:", err);
       } finally {
         setIsLoading(false);
       }
     }
 
     if (!favLoading) {
       fetchFavoriteEvents();
     }
   }, [user, favorites, favLoading]);
 
   const upcomingEvents = events.filter((e) => new Date(e.starts_at) > new Date() && e.is_active);
   const pastEvents = events.filter((e) => new Date(e.starts_at) <= new Date() || !e.is_active);
 
   const EventCard = ({ event }: { event: Event }) => {
     const isPast = new Date(event.starts_at) <= new Date() || !event.is_active;
     const startDate = new Date(event.starts_at);
 
     return (
       <Card className={`overflow-hidden transition-all ${isPast ? "opacity-60" : ""}`}>
         <CardContent className="p-4">
           <div className="flex items-start justify-between gap-3">
             <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-2">
                 {isPast ? (
                   <Badge variant="secondary" className="text-xs">Passé</Badge>
                 ) : (
                   <Badge className="bg-signal-green text-white text-xs">À venir</Badge>
                 )}
               </div>
               <Link to={`/events/${event.id}`}>
                 <h3 className="font-semibold text-foreground hover:text-coral transition-colors line-clamp-1">
                   {event.name}
                 </h3>
               </Link>
               <div className="mt-2 space-y-1.5">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <Calendar className="h-4 w-4 flex-shrink-0" />
                   <span>
                     {format(startDate, "EEEE d MMMM", { locale: fr })}
                   </span>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <Clock className="h-4 w-4 flex-shrink-0" />
                   <span>{format(startDate, "HH:mm", { locale: fr })}</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <MapPin className="h-4 w-4 flex-shrink-0" />
                   <span className="line-clamp-1">{event.location_name}</span>
                 </div>
               </div>
             </div>
             <EventFavoriteButton
               eventId={event.id}
               isFavorite={isFavorite(event.id)}
               onToggle={toggleFavorite}
               disabled={favLoading}
             />
           </div>
         </CardContent>
       </Card>
     );
   };
 
   return (
     <PageLayout showSidebar={false} className="pb-24 safe-bottom">
       {/* Header */}
       <header className="safe-top sticky top-0 z-10 px-6 py-4 flex items-center gap-4 bg-background/80 backdrop-blur-lg border-b border-border/50">
         <button
           onClick={() => navigate(-1)}
           className="p-2 rounded-lg hover:bg-muted transition-colors"
           aria-label="Retour"
         >
           <ArrowLeft className="h-6 w-6 text-foreground" />
         </button>
         <div className="flex-1">
           <h1 className="text-xl font-bold text-foreground">Mes Favoris</h1>
           <p className="text-sm text-muted-foreground">
             {events.length} événement{events.length > 1 ? "s" : ""} sauvegardé{events.length > 1 ? "s" : ""}
           </p>
         </div>
         <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
           <Heart className="h-5 w-5 text-coral fill-coral" />
         </div>
       </header>
 
       <div className="px-6 py-6 space-y-6">
         {isLoading || favLoading ? (
           <div className="space-y-4">
             {[1, 2, 3].map((i) => (
               <Skeleton key={i} className="h-32 rounded-xl" />
             ))}
           </div>
         ) : events.length === 0 ? (
           <EmptyState
             icon={Heart}
             title="Aucun favori"
             description="Vous n'avez pas encore sauvegardé d'événements. Parcourez les événements et appuyez sur le cœur pour les ajouter ici."
             actionLabel="Découvrir les événements"
             onAction={() => navigate("/events")}
           />
         ) : (
           <>
             {/* Upcoming Events */}
             {upcomingEvents.length > 0 && (
               <section>
                 <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-signal-green" />
                   À venir ({upcomingEvents.length})
                 </h2>
                 <div className="space-y-3">
                   {upcomingEvents.map((event) => (
                     <EventCard key={event.id} event={event} />
                   ))}
                 </div>
               </section>
             )}
 
             {/* Past Events */}
             {pastEvents.length > 0 && (
               <section>
                 <h2 className="text-lg font-bold text-muted-foreground mb-4 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                   Passés ({pastEvents.length})
                 </h2>
                 <div className="space-y-3">
                   {pastEvents.map((event) => (
                     <EventCard key={event.id} event={event} />
                   ))}
                 </div>
               </section>
             )}
           </>
         )}
       </div>
     </PageLayout>
   );
 }