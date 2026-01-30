import { useState } from 'react';
import { Map, Satellite, Navigation, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type MapStyleType = 'streets' | 'satellite' | 'navigation' | 'outdoors';

interface MapStyle {
  id: MapStyleType;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  lightUrl: string;
  darkUrl: string;
}

export const MAP_STYLES: MapStyle[] = [
  {
    id: 'streets',
    name: 'Rues',
    nameEn: 'Streets',
    icon: <Map className="h-4 w-4" />,
    lightUrl: 'mapbox://styles/mapbox/light-v11',
    darkUrl: 'mapbox://styles/mapbox/dark-v11',
  },
  {
    id: 'satellite',
    name: 'Satellite',
    nameEn: 'Satellite',
    icon: <Satellite className="h-4 w-4" />,
    lightUrl: 'mapbox://styles/mapbox/satellite-streets-v12',
    darkUrl: 'mapbox://styles/mapbox/satellite-streets-v12',
  },
  {
    id: 'navigation',
    name: 'Navigation',
    nameEn: 'Navigation',
    icon: <Navigation className="h-4 w-4" />,
    lightUrl: 'mapbox://styles/mapbox/navigation-day-v1',
    darkUrl: 'mapbox://styles/mapbox/navigation-night-v1',
  },
  {
    id: 'outdoors',
    name: 'Plein air',
    nameEn: 'Outdoors',
    icon: <Layers className="h-4 w-4" />,
    lightUrl: 'mapbox://styles/mapbox/outdoors-v12',
    darkUrl: 'mapbox://styles/mapbox/outdoors-v12',
  },
];

interface MapStyleSelectorProps {
  currentStyle: MapStyleType;
  onStyleChange: (style: MapStyleType) => void;
  className?: string;
}

export function MapStyleSelector({
  currentStyle,
  onStyleChange,
  className,
}: MapStyleSelectorProps) {
  const currentStyleData = MAP_STYLES.find(s => s.id === currentStyle) || MAP_STYLES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            'gap-2 bg-background/90 backdrop-blur-sm shadow-lg border border-border/50',
            'hover:bg-background/95',
            className
          )}
        >
          {currentStyleData.icon}
          <span className="hidden sm:inline">{currentStyleData.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px]">
        {MAP_STYLES.map((style) => (
          <DropdownMenuItem
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            className={cn(
              'gap-2 cursor-pointer',
              currentStyle === style.id && 'bg-accent'
            )}
          >
            {style.icon}
            <span>{style.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
