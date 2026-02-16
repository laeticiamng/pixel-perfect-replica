import { useState } from 'react';
import { X, Radio, RefreshCw, Info, Filter, Map, Radar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { BottomNav } from '@/components/BottomNav';
import { SwipeIndicator } from '@/components/SwipeIndicator';
import { PageLayout } from '@/components/PageLayout';
import { FullPageLoader } from '@/components/shared/FullPageLoader';
import {
  ActivitySelector,
  ActivityFilter,
  ExpirationTimer,
  LocationDescriptionInput,
  SearchingIndicator,
  InteractiveMap,
  SignalHistoryPanel,
  EmptyRadarState,
  LocationPermissionScreen,
  RadarSonarView,
} from '@/components/map';
import { EmergencyButton } from '@/components/safety';
import { ConnectionRequestsPanel } from '@/components/social';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useMapPageLogic } from '@/hooks/useMapPageLogic';
import { useLocationStore } from '@/stores/locationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';
import { ACTIVITIES } from '@/types/signal';
import { cn } from '@/lib/utils';

export default function MapPage() {
  const { t } = useTranslation();
  const { currentRouteIndex, totalRoutes } = useSwipeNavigation();
  const { position, error: locationError, isWatching } = useLocationStore();
  const { hasSeenLocationPrompt, setHasSeenLocationPrompt, showDemoSignals, setShowDemoSignals } = useSettingsStore();
  const [locationBannerDismissed, setLocationBannerDismissed] = useState(false);
  const {
    profile,
    settings,
    isActive,
    mySignal,
    myActivity,
    signalType,
    isDemoMode,
    showActivityModal,
    setShowActivityModal,
    selectedActivity,
    setSelectedActivity,
    showLegend,
    setShowLegend,
    isRefreshing,
    isActivating,
    activityFilters,
    showFilters,
    setShowFilters,
    locationDescription,
    setLocationDescription,
    lastUpdated,
    filteredNearbyUsers,
    openUsersCount,
    handleManualRefresh,
    handleSignalToggle,
    handleConfirmDeactivate,
    showDeactivateConfirm,
    setShowDeactivateConfirm,
    handleCycleSignalState,
    handleActivityConfirm,
    handleSignalExpired,
    handleExtendSignal,
    handleEmergencyTrigger,
    handleChangeActivity,
    handleUserClick,
    toggleActivityFilter,
    clearActivityFilters,
    getTimeSinceUpdate,
  } = useMapPageLogic();

  const currentActivityData = ACTIVITIES.find(a => a.id === myActivity);
  const [mapMode, setMapMode] = useState<'map' | 'radar'>('map');

  // Show location permission screen if not seen yet and no position
  const showLocationPrompt = !hasSeenLocationPrompt && !position && !locationError;
  
  const handleRequestLocation = () => {
    setHasSeenLocationPrompt(true);
  };

  const handleSkipLocation = () => {
    setHasSeenLocationPrompt(true);
    setShowDemoSignals(true);
  };

  const handleEnableDemo = () => {
    setShowDemoSignals(true);
  };

  // Show location permission screen
  if (showLocationPrompt) {
    return (
      <PageLayout className="pb-28" animate={false}>
        <div className="max-w-2xl mx-auto w-full h-[100dvh] flex flex-col">
          <LocationPermissionScreen
            onRequestPermission={handleRequestLocation}
            onSkip={handleSkipLocation}
          />
          <BottomNav />
        </div>
      </PageLayout>
    );
  }

  // Show loading state while waiting for position
  if (isWatching && !position && !locationError) {
    return (
      <PageLayout className="pb-28" animate={false}>
        <div className="max-w-2xl mx-auto w-full h-[100dvh] flex flex-col">
          <FullPageLoader message={t('mapUI.loadingMap')} />
          <BottomNav />
        </div>
      </PageLayout>
    );
  }

  // Geolocation error banner
  const showLocationBanner = locationError && !locationBannerDismissed;
  const locationBannerMessage = locationError === 'location_denied'
    ? t('mapUI.locationDenied')
    : t('mapUI.locationFallback');

  return (
    <PageLayout className="pb-28" animate={false}>
      <div className="max-w-2xl mx-auto w-full h-[100dvh] flex flex-col">
        {/* Geolocation fallback banner */}
        {showLocationBanner && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-signal-yellow/10 border border-signal-yellow/30 text-sm">
              <div className="flex items-center gap-2 text-signal-yellow">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{locationBannerMessage}</span>
              </div>
              <button onClick={() => setLocationBannerDismissed(true)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="safe-top px-6 py-4">
          <div className="glass-strong rounded-2xl p-4 shadow-medium">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={cn(
                    'w-3.5 h-3.5 rounded-full',
                    isActive ? 'bg-signal-green glow-green animate-pulse-signal' : 'bg-signal-red'
                  )} />
                  {isActive && <div className="absolute inset-0 rounded-full bg-signal-green/30 animate-ripple" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">
                    {isActive ? t('mapUI.youAreVisible') : t('mapUI.signalDisabled')}
                  </span>
                  {isActive && mySignal?.expires_at && (
                    <ExpirationTimer 
                      expiresAt={mySignal.expires_at} 
                      onExpire={handleSignalExpired}
                      onExtend={handleExtendSignal}
                      canExtend={true}
                      className="mt-1"
                    />
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isActive && myActivity && (
                  <button
                    onClick={handleChangeActivity}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-deep-blue-light/80 text-sm hover:bg-deep-blue-light transition-colors"
                  >
                    <span>{currentActivityData?.emoji}</span>
                    <span className="text-muted-foreground">{t(currentActivityData?.labelKey || 'activities.other')}</span>
                  </button>
                )}
                
                <button
                  onClick={handleManualRefresh}
                  aria-label={t('mapUI.refreshMap')}
                  className={cn(
                    "p-2.5 rounded-xl bg-deep-blue-light/80 text-muted-foreground hover:text-foreground hover:bg-deep-blue-light transition-all",
                    isRefreshing && "animate-spin"
                  )}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Mini legend + Open signals count */}
          <div className="mt-3 px-1">
            <div className="flex items-center gap-4 mb-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-signal-green" />
                <span className="text-muted-foreground">{t('mapUI.open')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-signal-yellow" />
                <span className="text-muted-foreground">{t('mapUI.conditional')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-coral" />
                <span className="text-muted-foreground">{t('mapUI.you')}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label={showFilters ? t('mapUI.hideFilters') : t('mapUI.showFilters')}
                  aria-expanded={showFilters}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    showFilters || activityFilters.length > 0
                      ? "bg-coral text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Filter className="h-4 w-4" />
                </button>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  <span className="text-signal-green font-bold">{openUsersCount}</span> 
                  {openUsersCount === 1 ? t('mapUI.personOpen') : t('mapUI.peopleOpen')}
                  {isDemoMode && (
                    <span className="px-2 py-0.5 rounded-full bg-signal-yellow/20 text-signal-yellow text-xs font-medium border border-signal-yellow/30">
                      {t('mapUI.demo')}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowLegend(!showLegend)}
                aria-label={showLegend ? t('mapUI.hideLegend') : t('mapUI.showLegend')}
                aria-expanded={showLegend}
                className="text-muted-foreground hover:text-foreground"
              >
                <Info className="h-4 w-4" />
              </button>
              <SignalHistoryPanel />
            </div>
          </div>
          
          {/* Activity Filters */}
          {showFilters && (
            <div className="mt-3 animate-slide-up">
              <ActivityFilter
                selectedActivities={activityFilters}
                onToggle={toggleActivityFilter}
                onClear={clearActivityFilters}
              />
            </div>
          )}
          
          {/* Legend */}
          {showLegend && (
            <div className="mt-3 glass rounded-xl p-4 animate-slide-up">
              <p className="text-xs font-bold text-coral uppercase tracking-wider mb-3">
                {t('mapUI.legendIntro')}
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-signal-green shadow-sm" />
                  <span className="text-foreground font-medium">{t('mapUI.open')}</span>
                  <span className="text-muted-foreground">{t('mapUI.openDesc')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-signal-yellow shadow-sm" />
                  <span className="text-foreground font-medium">{t('mapUI.conditional')}</span>
                  <span className="text-muted-foreground">{t('mapUI.conditionalDesc')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-coral shadow-sm" />
                  <span className="text-foreground font-medium">{t('mapUI.you')}</span>
                  <span className="text-muted-foreground">{t('mapUI.youDesc')}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-medium">
                {t('mapUI.distance')}: {settings.visibility_distance}m • {t('mapUI.refresh')}: 30s
              </p>
            </div>
          )}
        </header>

        {/* Searching Indicator */}
        {isActive && (
          <div className="px-6 mb-4">
            <SearchingIndicator 
              isSearching={isActive} 
              nearbyCount={filteredNearbyUsers.length}
            />
          </div>
        )}

        {/* View mode + Signal state */}
        <div className="px-4 sm:px-6 mb-3 flex items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-muted p-1">
            <button
              onClick={() => setMapMode('map')}
              className={cn('px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2', mapMode === 'map' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}
            >
              <Map className="h-4 w-4" />
              {t('mapUI.mapView')}
            </button>
            <button
              onClick={() => setMapMode('radar')}
              className={cn('px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2', mapMode === 'radar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}
            >
              <Radar className="h-4 w-4" />
              {t('mapUI.radarView')}
            </button>
          </div>

          {isActive && (
            <button
              onClick={handleCycleSignalState}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-semibold border transition-colors',
                signalType === 'green' && 'bg-signal-green/10 text-signal-green border-signal-green/40',
                signalType === 'yellow' && 'bg-signal-yellow/10 text-signal-yellow border-signal-yellow/40',
                signalType === 'red' && 'bg-signal-red/10 text-signal-red border-signal-red/40',
              )}
            >
              {signalType === 'green' ? t('mapUI.open') : signalType === 'yellow' ? t('mapUI.conditional') : t('mapUI.busy')}
            </button>
          )}
        </div>

        {/* Interactive Map / Radar */}
        <div className="flex-1 min-h-0 px-4 sm:px-6">
          {filteredNearbyUsers.length === 0 && !isActive && !isDemoMode ? (
            <EmptyRadarState 
              onActivateSignal={handleSignalToggle}
              isDemoMode={isDemoMode}
              onEnableDemo={showDemoSignals ? undefined : handleEnableDemo}
            />
          ) : mapMode === 'map' ? (
            <InteractiveMap
              nearbyUsers={filteredNearbyUsers.map(u => ({
                id: u.id,
                user_id: u.id,
                firstName: u.firstName,
                signal: u.signal,
                activity: u.activity,
                latitude: u.position?.latitude || 0,
                longitude: u.position?.longitude || 0,
                distance: u.distance,
                avatar_url: undefined,
                rating: u.rating,
                activeSince: u.activeSince,
              }))}
              isActive={isActive}
              myActivity={myActivity}
              onUserClick={handleUserClick}
              visibilityDistance={settings.visibility_distance}
              className="w-full h-full"
              userInitial={profile?.first_name?.charAt(0).toUpperCase() || '?'}
              activityFilters={activityFilters}
              onActivityFilterToggle={toggleActivityFilter}
            />
          ) : (
            <RadarSonarView
              users={filteredNearbyUsers}
              maxDistance={settings.visibility_distance}
              className="w-full h-full"
              onUserClick={handleUserClick}
            />
          )}
        </div>

        {/* Connection Requests */}
        <div className="px-6">
          <ConnectionRequestsPanel />
        </div>

        {/* Signal Button */}
        <div className="px-6 mb-4">
          <button
            onClick={handleSignalToggle}
            aria-label={isActive ? t('mapUI.deactivateSignal') : t('mapUI.activateSignal')}
            className={cn(
              'w-full h-20 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-medium',
              'font-bold text-lg',
              isActive
                ? 'bg-gradient-to-r from-signal-green/20 to-signal-green/10 border-2 border-signal-green text-signal-green glow-green'
                : 'bg-gradient-to-r from-coral/20 to-coral/10 border-2 border-coral text-coral animate-glow-pulse hover:scale-[1.02]'
            )}
          >
            <Radio className="h-6 w-6" />
            {isActive ? t('mapUI.tapToDeactivate') : t('mapUI.tapToActivate')}
          </button>
          
          {lastUpdated && (
            <p className="text-center text-xs text-muted-foreground mt-3 font-medium">
              {t('mapUI.lastUpdate', { time: getTimeSinceUpdate() || '' })}
            </p>
          )}
        </div>

        {/* Activity Modal */}
        {showActivityModal && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-[500px] glass-strong rounded-t-3xl p-6 pb-8 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('mapUI.openTo')}</h2>
                  <p className="text-sm text-muted-foreground">{t('mapUI.signalThat')}</p>
                </div>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="p-2 rounded-lg hover:bg-muted"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              
              <ActivitySelector
                selectedActivity={selectedActivity}
                onSelect={setSelectedActivity}
              />

              <div className="mt-4">
                <LocationDescriptionInput
                  value={locationDescription}
                  onChange={setLocationDescription}
                  placeholder={t('mapUI.wherePlaceholder')}
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowActivityModal(false);
                    setLocationDescription('');
                  }}
                  className="flex-1 h-12 rounded-xl"
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleActivityConfirm}
                  disabled={!selectedActivity || isActivating}
                  className="flex-1 h-12 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
                >
                  {isActivating ? t('mapUI.activating') : t('confirm')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Button */}
        <div className="fixed bottom-32 right-4 z-40">
          <EmergencyButton onTrigger={handleEmergencyTrigger} />
        </div>

        {/* Swipe Indicator */}
        <div className="fixed bottom-24 left-0 right-0 z-40 pointer-events-none">
          <SwipeIndicator currentIndex={currentRouteIndex} totalRoutes={totalRoutes} />
        </div>

        <BottomNav />

        {/* Signal deactivation confirmation */}
        <AlertDialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('mapToasts.signalDeactivated')}</AlertDialogTitle>
              <AlertDialogDescription>{t('map.deactivateConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeactivate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('map.deactivate')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
}
