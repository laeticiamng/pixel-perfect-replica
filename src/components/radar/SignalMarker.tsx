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
    sm: 'w-11 h-11 text-lg',
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-3xl',
  };
  
  const glowClasses = {
    green: 'glow-green border-signal-green',
    yellow: 'glow-yellow border-signal-yellow',
    red: 'glow-red border-signal-red',
  };
  
  const bgClasses = {
    green: 'bg-gradient-to-br from-signal-green/30 to-signal-green/10',
    yellow: 'bg-gradient-to-br from-signal-yellow/30 to-signal-yellow/10',
    red: 'bg-gradient-to-br from-signal-red/30 to-signal-red/10',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-soft',
        'border-2 animate-pulse-signal backdrop-blur-sm',
        sizeClasses[size],
        glowClasses[signal],
        bgClasses[signal],
        onClick && 'hover:scale-115 active:scale-95'
      )}
    >
      {/* Inner content */}
      <span className="relative z-10">
        {isClose && firstName ? (
          <span className="font-bold text-foreground drop-shadow-sm">
            {firstName.charAt(0).toUpperCase()}
          </span>
        ) : (
          <span className="drop-shadow-sm">{emoji}</span>
        )}
      </span>
      
      {/* Pulse rings - multiple for depth */}
      <div className={cn(
        'absolute inset-0 rounded-full animate-ripple',
        signal === 'green' && 'bg-signal-green/30',
        signal === 'yellow' && 'bg-signal-yellow/30',
        signal === 'red' && 'bg-signal-red/30',
      )} />
      <div className={cn(
        'absolute inset-0 rounded-full animate-ripple',
        signal === 'green' && 'bg-signal-green/15',
        signal === 'yellow' && 'bg-signal-yellow/15',
        signal === 'red' && 'bg-signal-red/15',
      )} style={{ animationDelay: '0.4s' }} />
    </button>
  );
}
