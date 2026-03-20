import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FullPageLoaderProps {
  message?: string;
  className?: string;
  /** Timeout in ms before showing a retry prompt (default: 15000) */
  timeout?: number;
}

export function FullPageLoader({ message, className, timeout = 15000 }: FullPageLoaderProps) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (timeout <= 0) return;
    const timer = setTimeout(() => setTimedOut(true), timeout);
    return () => clearTimeout(timer);
  }, [timeout]);

  if (timedOut) {
    return (
      <div
        role="alert"
        className={cn(
          "min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6",
          className
        )}
      >
        <div className="w-16 h-16 rounded-full bg-signal-yellow/20 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 text-signal-yellow" />
        </div>
        <div className="text-center">
          <p className="text-foreground font-medium mb-1">Taking longer than expected</p>
          <p className="text-muted-foreground text-sm mb-4">
            {message || 'The page is still loading. You can try reloading.'}
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="bg-coral hover:bg-coral/90 text-primary-foreground rounded-xl"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload
        </Button>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
      "min-h-screen bg-background flex flex-col items-center justify-center gap-6",
      className
    )}>
      {/* Animated logo/spinner */}
      <div className="relative">
        {/* Outer pulsing ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-coral/20 blur-xl"
          style={{ transform: 'scale(1.5)' }}
        />

        {/* Spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-muted border-t-coral"
        />

        {/* Center dot */}
        <motion.div
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-4 h-4 rounded-full bg-coral glow-coral" />
        </motion.div>
      </div>

      {/* Screen reader fallback */}
      {!message && <span className="sr-only">Loading...</span>}
      {/* Message */}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-sm"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
