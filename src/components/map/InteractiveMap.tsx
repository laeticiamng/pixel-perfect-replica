import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, Source, Layer, Popup } from 'react-map-gl/mapbox';
import type { MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Map as MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocationStore } from '@/stores/locationStore';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/hooks/useTheme';
import { ACTIVITIES, ActivityType } from '@/types/signal';
import { AnimatedMarker } from './AnimatedMarker';
import { MapStyleSelector, MAP_STYLES, MapStyleType } from './MapStyleSelector';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { ClusterMarker } from './ClusterMarker';
import { ActivityFilterBar } from './ActivityFilterBar';
import { UserPopupCard } from './UserPopupCard';
import { EventMapMarker, EventPopupCard, isEventHappeningNow, type MapEvent } from './EventMapMarker';
import { GroupSignalMarker } from './GroupSignalMarker';
import { GroupSignalPopup } from './GroupSignalPopup';
import { useClustering, ClusterPoint } from '@/hooks/useClustering';
import { useBatchVerificationBadges } from '@/hooks/useBatchVerificationBadges';
import { logger } from '@/lib/logger';
import { ShieldCheck } from 'lucide-react';
import type { GroupSignal } from '@/hooks/useGroupSignals';

interface NearbyUser {
  id: string;
  user_id: string;
  firstName: string;
  signal: 'green' | 'yellow' | 'red';
  activity: string;
  latitude: number;
  longitude: number;
  distance?: number;
  avatar_url?: string;
  rating?: number;
  activeSince?: Date;
}

interface InteractiveMapProps {
  nearbyUsers: NearbyUser[];
  events?: MapEvent[];
  groupSignals?: GroupSignal[];
  isActive: boolean;
  myActivity?: string | null;
  onUserClick: (userId: string, distance?: number) => void;
  onEventClick?: (eventId: string) => void;
  onEventJoin?: (eventId: string) => void;
  onEventLeave?: (eventId: string) => void;
  onGroupJoin?: (groupId: string) => void;
  onGroupLeave?: (groupId: string) => void;
  onGroupChat?: (group: GroupSignal) => void;
  joinedEventIds?: Set<string>;
  eventParticipantCounts?: Record<string, number>;
  visibilityDistance: number;
  className?: string;
  userInitial?: string;
  activityFilters?: ActivityType[];
  onActivityFilterToggle?: (activity: ActivityType) => void;
  groupSignalLoading?: boolean;
}

export function InteractiveMap({
  nearbyUsers,
  events = [],
  groupSignals = [],
  isActive,
  myActivity,
  onUserClick,
  onEventClick,
  onEventJoin,
  onEventLeave,
  onGroupJoin,
  onGroupLeave,
  onGroupChat,
  joinedEventIds = new Set(),
  eventParticipantCounts = {},
  visibilityDistance,
  className,
  userInitial = '?',
  activityFilters = [],
  onActivityFilterToggle,
  groupSignalLoading,
}: InteractiveMapProps) {
  const mapRef = useRef<MapRef>(null);
  const { position } = useLocationStore();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyleType>('streets');
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupSignal | null>(null);
  const [currentZoom, setCurrentZoom] = useState(15);
  const [mapReady, setMapReady] = useState(false);
  const hasInitialCentered = useRef(false);
  
  // Initial view state - used for uncontrolled mode which works better across browsers
  const initialViewState = useMemo(() => ({
    latitude: position?.latitude || 48.8566,
    longitude: position?.longitude || 2.3522,
    zoom: 15,
    bearing: 0,
    pitch: 45,
  }), []);

  // Convert nearby users to cluster points
  const clusterPoints: ClusterPoint[] = useMemo(() => 
    nearbyUsers.map(user => ({
      id: user.id,
      user_id: user.user_id,
      firstName: user.firstName,
      signal: user.signal,
      activity: user.activity,
      latitude: user.latitude,
      longitude: user.longitude,
      distance: user.distance,
      avatar_url: user.avatar_url,
      rating: user.rating,
    })),
  [nearbyUsers]);

  // Use clustering hook
  const { clusters, getClusterExpansionZoom } = useClustering({
    points: clusterPoints,
    bounds,
    zoom: currentZoom,
  });

  // Batch-fetch verification badges for all visible users
  const visibleUserIds = useMemo(() => nearbyUsers.map(u => u.user_id), [nearbyUsers]);
  const verifiedUserIds = useBatchVerificationBadges(visibleUserIds);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        // Try to refresh the session first to get a fresh token
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session) {
            logger.ui.warning('InteractiveMap: session refresh failed: ' + (refreshError?.message || ''));
            setError(t('map.unavailable'));
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          // Handle auth errors specifically
          if (error.message?.includes('401') || error.message?.includes('non-2xx')) {
            logger.ui.warning('InteractiveMap: auth error fetching token: ' + error.message);
            setError(t('map.unavailable'));
          } else {
            throw error;
          }
          return;
        }
        
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          throw new Error('No token returned');
        }
      } catch (err: unknown) {
        logger.ui.error('InteractiveMap', String(err));
        setError(t('map.unavailable'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchToken();
  }, []);

  // Center on user position when map is ready and position is available
  useEffect(() => {
    if (position && mapReady && mapRef.current && !hasInitialCentered.current) {
      hasInitialCentered.current = true;
      mapRef.current.flyTo({
        center: [position.longitude, position.latitude],
        zoom: 15,
        duration: 1500,
        essential: true,
      });
    }
  }, [position, mapReady]);

  // Update map center when position changes significantly (more than 100m)
  const lastCenteredPosition = useRef<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (position && mapReady && mapRef.current && hasInitialCentered.current) {
      const lastPos = lastCenteredPosition.current;
      if (!lastPos || 
          Math.abs(position.latitude - lastPos.lat) > 0.001 || 
          Math.abs(position.longitude - lastPos.lng) > 0.001) {
        lastCenteredPosition.current = { lat: position.latitude, lng: position.longitude };
        mapRef.current.flyTo({
          center: [position.longitude, position.latitude],
          duration: 1000,
          essential: true,
        });
      }
    }
  }, [position, mapReady]);

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    // Track current zoom for clustering
    setCurrentZoom(evt.viewState.zoom);
    
    // Update bounds for clustering
    const map = mapRef.current?.getMap();
    if (map) {
      const mapBounds = map.getBounds();
      if (mapBounds) {
        setBounds([
          mapBounds.getWest(),
          mapBounds.getSouth(),
          mapBounds.getEast(),
          mapBounds.getNorth(),
        ]);
      }
    }
  }, []);

  // Update bounds on initial load and enable all interactions
  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      // Explicitly enable all interactions on the native map object
      map.dragPan.enable();
      map.scrollZoom.enable();
      map.boxZoom.enable();
      map.doubleClickZoom.enable();
      map.keyboard.enable();
      map.dragRotate.enable();
      map.touchZoomRotate.enable();
      
      const mapBounds = map.getBounds();
      if (mapBounds) {
        setBounds([
          mapBounds.getWest(),
          mapBounds.getSouth(),
          mapBounds.getEast(),
          mapBounds.getNorth(),
        ]);
      }
      
      // Mark map as ready for centering
      setMapReady(true);
    }
  }, []);

  const handleClusterClick = useCallback((clusterId: number, longitude: number, latitude: number) => {
    const expansionZoom = getClusterExpansionZoom(clusterId);
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      zoom: Math.min(expansionZoom, 18),
      duration: 500,
    });
  }, [getClusterExpansionZoom]);

  const handleMarkerClick = useCallback((user: ClusterPoint) => {
    // Find the full user from nearbyUsers for activeSince
    const fullUser = nearbyUsers.find(u => u.id === user.id);
    setSelectedUser(fullUser || { ...user, activeSince: undefined });
  }, [nearbyUsers]);

  const handlePopupContact = useCallback((userId: string) => {
    const user = nearbyUsers.find(u => u.user_id === userId);
    onUserClick(userId, user?.distance);
    setSelectedUser(null);
  }, [nearbyUsers, onUserClick]);

  const getActivityEmoji = (activity: string) => {
    const act = ACTIVITIES.find(a => a.id === activity);
    return act?.emoji || '✨';
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'green': return 'bg-signal-green';
      case 'yellow': return 'bg-signal-yellow';
      case 'red': return 'bg-signal-red';
      default: return 'bg-coral';
    }
  };

  // Get current map style URL based on theme
  const currentMapStyle = useMemo(() => {
    const style = MAP_STYLES.find(s => s.id === mapStyle) || MAP_STYLES[0];
    return theme === 'dark' ? style.darkUrl : style.lightUrl;
  }, [mapStyle, theme]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center bg-muted rounded-2xl", className)}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-coral border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t('map.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !mapboxToken) {
    return (
      <div className={cn("flex items-center justify-center bg-muted rounded-2xl", className)}>
        <div className="flex flex-col items-center gap-3 text-center p-6">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <MapIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{error || t('map.unavailable')}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("relative rounded-2xl overflow-hidden", className)}
      data-map-container
      style={{ 
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        onMove={handleMove}
        onLoad={handleLoad}
        mapboxAccessToken={mapboxToken}
        mapStyle={currentMapStyle}
        style={{ 
          width: '100%', 
          height: '100%',
          cursor: 'grab',
        }}
        attributionControl={false}
        interactive={true}
        dragPan={true}
        scrollZoom={true}
        boxZoom={true}
        doubleClickZoom={true}
        keyboard={true}
        touchZoomRotate={true}
        touchPitch={true}
        dragRotate={true}
      >
        <NavigationControl position="bottom-right" showCompass={true} showZoom={true} />
        <GeolocateControl 
          position="bottom-right" 
          trackUserLocation={true}
          showUserHeading={true}
        />

        {/* Visibility radius circle */}
        {position && (
          <Source
            id="visibility-radius"
            type="geojson"
            data={{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [position.longitude, position.latitude],
              },
              properties: {},
            }}
          >
            <Layer
              id="visibility-radius-fill"
              type="circle"
              paint={{
                'circle-radius': {
                  stops: [
                    [0, 0],
                    [20, visibilityDistance * 1.5],
                  ],
                  base: 2,
                },
                'circle-color': 'hsl(10, 90%, 60%)',
                'circle-opacity': 0.08,
                'circle-stroke-width': 2,
                'circle-stroke-color': 'hsl(10, 90%, 60%)',
                'circle-stroke-opacity': 0.3,
              }}
            />
          </Source>
        )}

        {/* User's position marker with animation */}
        {position && (
          <AnimatedMarker
            latitude={position.latitude}
            longitude={position.longitude}
          >
            <div className="relative">
              <div className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center border-4 border-white shadow-xl',
                isActive 
                  ? 'bg-gradient-to-br from-coral to-coral-dark' 
                  : 'bg-muted'
              )}>
                <span className="text-xl font-bold text-white">
                  {userInitial}
                </span>
              </div>
              {/* Activity badge */}
              {isActive && myActivity && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background border-2 border-white shadow-md flex items-center justify-center text-sm">
                  {getActivityEmoji(myActivity)}
                </div>
              )}
              {/* Pulse effect when active */}
              {isActive && (
                <>
                  <div className="absolute inset-0 rounded-full bg-coral/30 animate-ping" />
                  <div className="absolute -inset-2 rounded-full border-2 border-coral/40 animate-pulse" />
                </>
              )}
            </div>
          </AnimatedMarker>
        )}

        {/* Clustered nearby users markers */}
        <>
          {clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const { cluster: isCluster, point_count, cluster_id, user } = cluster.properties;

            if (isCluster) {
              return (
                <Marker
                  key={`cluster-${cluster_id}`}
                  latitude={latitude}
                  longitude={longitude}
                  anchor="center"
                >
                  <ClusterMarker
                    pointCount={point_count || 0}
                    onClick={() => handleClusterClick(cluster_id!, longitude, latitude)}
                  />
                </Marker>
              );
            }

            // Single user marker with animation
            if (!user) return null;

            return (
              <AnimatedMarker
                key={user.id}
                markerKey={user.id}
                latitude={user.latitude}
                longitude={user.longitude}
                onClick={() => handleMarkerClick(user)}
              >
                <button
                  className="relative cursor-pointer transform transition-transform hover:scale-110 active:scale-95"
                  aria-label={`Signal ${user.signal} - ${user.firstName}`}
                >
                  {/* Signal glow */}
                  <div className={cn(
                    'absolute -inset-1 rounded-full opacity-40 blur-sm',
                    getSignalColor(user.signal)
                  )} />
                  
                  {/* Main marker */}
                  <div className={cn(
                    'relative w-12 h-12 rounded-full flex items-center justify-center border-3 border-white shadow-lg',
                    getSignalColor(user.signal)
                  )}>
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.firstName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-white">
                        {user.firstName?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* Activity badge */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-white shadow-md flex items-center justify-center text-xs">
                    {getActivityEmoji(user.activity)}
                  </div>

                  {/* Verified badge */}
                  {verifiedUserIds.has(user.user_id) && (
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-signal-green border-2 border-white shadow-md flex items-center justify-center">
                      <ShieldCheck className="h-3 w-3 text-white" />
                    </div>
                  )}
                  
                  {/* Distance badge */}
                  {user.distance && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-background/90 border border-border text-[10px] font-medium text-foreground shadow">
                      {user.distance < 1000 ? `${Math.round(user.distance)}m` : `${(user.distance / 1000).toFixed(1)}km`}
                    </div>
                  )}
                </button>
              </AnimatedMarker>
            );
          })}
        </>

        {/* Event markers */}
        {events.map((event) => {
          const happeningNow = isEventHappeningNow(event);
          return (
            <AnimatedMarker
              key={`event-${event.id}`}
              markerKey={`event-${event.id}`}
              latitude={event.latitude}
              longitude={event.longitude}
              onClick={() => {
                setSelectedUser(null);
                setSelectedEvent(event);
              }}
            >
              <EventMapMarker
                event={event}
                isHappeningNow={happeningNow}
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedEvent(event);
                }}
              />
            </AnimatedMarker>
          );
        })}

        {/* Event popup */}
        {selectedEvent && (
          <Popup
            latitude={selectedEvent.latitude}
            longitude={selectedEvent.longitude}
            anchor="bottom"
            onClose={() => setSelectedEvent(null)}
            closeButton={false}
            closeOnClick={false}
            offset={25}
            className="!p-0 !bg-transparent [&_.mapboxgl-popup-content]:!p-0 [&_.mapboxgl-popup-content]:!bg-transparent [&_.mapboxgl-popup-content]:!shadow-none [&_.mapboxgl-popup-tip]:!border-t-transparent"
          >
            <EventPopupCard
              event={selectedEvent}
              isHappeningNow={isEventHappeningNow(selectedEvent)}
              isJoined={joinedEventIds.has(selectedEvent.id)}
              participantCount={eventParticipantCounts[selectedEvent.id] || 0}
              onJoin={() => { onEventJoin?.(selectedEvent.id); setSelectedEvent(null); }}
              onLeave={() => { onEventLeave?.(selectedEvent.id); setSelectedEvent(null); }}
              onViewDetails={() => { onEventClick?.(selectedEvent.id); setSelectedEvent(null); }}
              onClose={() => setSelectedEvent(null)}
            />
          </Popup>
        )}

        {/* Group signal markers */}
        {groupSignals.map((group) => (
          <AnimatedMarker
            key={`group-${group.id}`}
            markerKey={`group-${group.id}`}
            latitude={group.latitude}
            longitude={group.longitude}
            onClick={() => {
              setSelectedUser(null);
              setSelectedEvent(null);
              setSelectedGroup(group);
            }}
          >
            <GroupSignalMarker
              group={group}
              onClick={() => {
                setSelectedUser(null);
                setSelectedEvent(null);
                setSelectedGroup(group);
              }}
            />
          </AnimatedMarker>
        ))}

        {/* Group signal popup */}
        {selectedGroup && (
          <Popup
            latitude={selectedGroup.latitude}
            longitude={selectedGroup.longitude}
            anchor="bottom"
            onClose={() => setSelectedGroup(null)}
            closeButton={false}
            closeOnClick={false}
            offset={35}
            className="!p-0 !bg-transparent [&_.mapboxgl-popup-content]:!p-0 [&_.mapboxgl-popup-content]:!bg-transparent [&_.mapboxgl-popup-content]:!shadow-none [&_.mapboxgl-popup-tip]:!border-t-transparent"
          >
            <GroupSignalPopup
              group={selectedGroup}
              onClose={() => setSelectedGroup(null)}
              onJoin={() => { onGroupJoin?.(selectedGroup.id); setSelectedGroup(null); }}
              onLeave={() => { onGroupLeave?.(selectedGroup.id); setSelectedGroup(null); }}
              onOpenChat={() => { onGroupChat?.(selectedGroup); setSelectedGroup(null); }}
              isLoading={groupSignalLoading}
            />
          </Popup>
        )}

        {/* User popup card */}
        {selectedUser && (
          <Popup
            latitude={selectedUser.latitude}
            longitude={selectedUser.longitude}
            anchor="bottom"
            onClose={() => setSelectedUser(null)}
            closeButton={false}
            closeOnClick={false}
            offset={25}
            className="!p-0 !bg-transparent [&_.mapboxgl-popup-content]:!p-0 [&_.mapboxgl-popup-content]:!bg-transparent [&_.mapboxgl-popup-content]:!shadow-none [&_.mapboxgl-popup-tip]:!border-t-transparent"
          >
            <UserPopupCard
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onContact={handlePopupContact}
            />
          </Popup>
        )}
      </Map>

      {/* Map style selector */}
      <div className="absolute top-3 left-3 z-10">
        <MapStyleSelector
          currentStyle={mapStyle}
          onStyleChange={setMapStyle}
        />
      </div>

      {/* Activity filter bar */}
      {onActivityFilterToggle && (
        <div className="absolute top-3 right-3 z-10">
          <ActivityFilterBar
            selectedActivities={activityFilters}
            onToggle={onActivityFilterToggle}
          />
        </div>
      )}

      {/* Map overlay gradient at bottom for better UI */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
    </div>
  );
}
