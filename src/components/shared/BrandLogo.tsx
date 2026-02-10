import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  alt?: string;
  fallbackClassName?: string;
}

export function BrandLogo({ className, alt = 'NEARVITY Logo', fallbackClassName }: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span
        aria-label="NEARVITY"
        className={cn('inline-flex items-center justify-center font-bold text-white', fallbackClassName)}
      >
        N
      </span>
    );
  }

  return (
    <img
      src="/nearvity-logo.png"
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
