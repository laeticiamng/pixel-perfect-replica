import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FullPageLoaderProps {
  message?: string;
  className?: string;
}

export function FullPageLoader({ message, className }: FullPageLoaderProps) {
  return (
    <div className={cn(
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
