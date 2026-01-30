import { cn } from '@/lib/utils';

interface ClusterMarkerProps {
  pointCount: number;
  onClick: () => void;
}

export function ClusterMarker({ pointCount, onClick }: ClusterMarkerProps) {
  // Size based on point count
  const getSize = () => {
    if (pointCount < 5) return 'w-10 h-10 text-sm';
    if (pointCount < 10) return 'w-12 h-12 text-base';
    if (pointCount < 25) return 'w-14 h-14 text-lg';
    return 'w-16 h-16 text-xl';
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-full flex items-center justify-center font-bold text-white cursor-pointer',
        'bg-gradient-to-br from-coral to-coral-dark',
        'border-3 border-white shadow-xl',
        'transform transition-all duration-200 hover:scale-110 active:scale-95',
        getSize()
      )}
      aria-label={`Cluster de ${pointCount} utilisateurs`}
    >
      {/* Pulse animation */}
      <div className="absolute inset-0 rounded-full bg-coral/30 animate-ping" />
      
      {/* Count */}
      <span className="relative z-10">{pointCount}</span>
      
      {/* Outer ring */}
      <div className="absolute -inset-1 rounded-full border-2 border-coral/40 animate-pulse" />
    </button>
  );
}
