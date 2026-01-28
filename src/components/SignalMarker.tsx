import { cn } from '@/lib/utils';
import { SignalType, ActivityType, ACTIVITIES } from '@/types/signal';

interface SignalMarkerProps {
  signal: SignalType;
  activity: ActivityType;
  distance?: number;
  firstName?: string;
  isClose?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function SignalMarker({
  signal,
  activity,
  distance,
  firstName,
  isClose = false,
  onClick,
  size = 'md',
}: SignalMarkerProps) {
  const activityData = ACTIVITIES.find(a => a.id === activity);
  const emoji = activityData?.emoji || '✨';
  
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-3xl',
  };
  
  const glowClasses = {
    green: 'glow-green border-signal-green',
    yellow: 'glow-yellow border-signal-yellow',
    red: 'glow-red border-signal-red',
  };
  
  const bgClasses = {
    green: 'bg-signal-green/20',
    yellow: 'bg-signal-yellow/20',
    red: 'bg-signal-red/20',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer',
        'border-2 animate-pulse-signal',
        sizeClasses[size],
        glowClasses[signal],
        bgClasses[signal],
        onClick && 'hover:scale-110 active:scale-95'
      )}
    >
      {/* Inner content */}
      <span className="relative z-10">
        {isClose && firstName ? (
          <span className="font-bold text-foreground">
            {firstName.charAt(0).toUpperCase()}
          </span>
        ) : (
          emoji
        )}
      </span>
      
      {/* Pulse rings */}
      <div className={cn(
        'absolute inset-0 rounded-full animate-ripple',
        signal === 'green' && 'bg-signal-green/30',
        signal === 'yellow' && 'bg-signal-yellow/30',
        signal === 'red' && 'bg-signal-red/30',
      )} />
    </button>
  );
}
