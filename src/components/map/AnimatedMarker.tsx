import { useEffect, useRef, useState } from 'react';
import { Marker } from 'react-map-gl/mapbox';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedMarkerProps {
  latitude: number;
  longitude: number;
  children: React.ReactNode;
  onClick?: () => void;
  animationDuration?: number;
  markerKey?: string;
}

export function AnimatedMarker({
  latitude,
  longitude,
  children,
  onClick,
  animationDuration = 1000,
  markerKey,
}: AnimatedMarkerProps) {
  const [currentPos, setCurrentPos] = useState({ lat: latitude, lng: longitude });
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startPosRef = useRef({ lat: latitude, lng: longitude });

  useEffect(() => {
    // If position changed, animate to new position
    if (latitude !== currentPos.lat || longitude !== currentPos.lng) {
      // Cancel any ongoing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      startPosRef.current = { lat: currentPos.lat, lng: currentPos.lng };
      startTimeRef.current = performance.now();
      setIsAnimating(true);

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / animationDuration, 1);

        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - progress, 3);

        const newLat = startPosRef.current.lat + (latitude - startPosRef.current.lat) * eased;
        const newLng = startPosRef.current.lng + (longitude - startPosRef.current.lng) * eased;

        setCurrentPos({ lat: newLat, lng: newLng });

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [latitude, longitude, animationDuration]);

  return (
    <Marker
      latitude={currentPos.lat}
      longitude={currentPos.lng}
      anchor="center"
      onClick={onClick}
    >
      <motion.div
        key={markerKey}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1]
        }}
        className={cn(
          'transition-transform duration-200',
          isAnimating && 'scale-105'
        )}
      >
        {children}
      </motion.div>
    </Marker>
  );
}
