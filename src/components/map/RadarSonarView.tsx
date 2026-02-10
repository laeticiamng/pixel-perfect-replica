import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface RadarUser {
  id: string;
  firstName: string;
  signal: 'green' | 'yellow' | 'red';
  distance?: number;
}

interface RadarSonarViewProps {
  users: RadarUser[];
  maxDistance: number;
  className?: string;
  onUserClick?: (userId: string, distance?: number) => void;
}

const signalClassMap: Record<RadarUser['signal'], string> = {
  green: 'bg-signal-green',
  yellow: 'bg-signal-yellow',
  red: 'bg-signal-red',
};

export function RadarSonarView({ users, maxDistance, className, onUserClick }: RadarSonarViewProps) {
  const plottedUsers = useMemo(
    () => users.slice(0, 20).map((user, index) => {
      const safeDistance = Math.max(0, user.distance ?? maxDistance / 2);
      const normalizedDistance = Math.min(1, safeDistance / Math.max(1, maxDistance));
      const radiusPercent = normalizedDistance * 42;
      const angle = ((index * 137.5) % 360) * (Math.PI / 180);
      const x = 50 + Math.cos(angle) * radiusPercent;
      const y = 50 + Math.sin(angle) * radiusPercent;

      return {
        ...user,
        x,
        y,
      };
    }),
    [users, maxDistance],
  );

  return (
    <div className={cn('relative rounded-2xl overflow-hidden bg-gradient-to-b from-deep-blue-light/30 to-background border border-border', className)}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[20, 40, 60, 80].map((size, idx) => (
          <div
            key={size}
            className="absolute rounded-full border border-coral/25"
            style={{ width: `${size}%`, height: `${size}%`, animationDelay: `${idx * 140}ms` }}
          />
        ))}
        <div className="absolute w-[92%] h-[92%] rounded-full border border-coral/20 animate-pulse" />
        <div className="absolute w-1/2 h-1/2 origin-bottom-right animate-radar-sweep bg-gradient-to-r from-coral/5 via-coral/20 to-coral/5" />
      </div>

      <div className="relative h-full min-h-[300px]">
        <div className="absolute inset-0">
          {plottedUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => onUserClick?.(user.id, user.distance)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${user.x}%`, top: `${user.y}%` }}
              aria-label={`${user.firstName} - ${user.signal}`}
            >
              <span className={cn('absolute inset-0 rounded-full blur-md opacity-55 animate-pulse', signalClassMap[user.signal])} />
              <span className={cn('relative flex items-center justify-center h-11 w-11 rounded-full border-2 border-white text-white font-bold text-sm shadow-lg', signalClassMap[user.signal])}>
                {user.firstName?.charAt(0).toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-14 w-14 rounded-full bg-coral border-4 border-white shadow-xl flex items-center justify-center text-white font-bold">
            ME
          </div>
        </div>
      </div>
    </div>
  );
}
