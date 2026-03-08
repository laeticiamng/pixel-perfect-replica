import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { RevealText } from './RevealText';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  className?: string;
  size?: 'default' | 'large';
}

export const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  function FeatureCard({ icon: Icon, title, description, delay = 0, className, size = 'default' }, ref) {
    return (
      <RevealText delay={delay} ref={ref}>
        <motion.div 
          className={cn(
            'group relative overflow-hidden rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md transition-all duration-500 hover:border-coral/30',
            size === 'large' ? 'p-8 md:p-10' : 'p-6',
            className
          )}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.3 }}
        >
          {/* Gradient hover overlay */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-coral/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Animated gradient border on hover */}
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-px rounded-3xl bg-card/60 backdrop-blur-md" />
          </div>
          
          {/* Top shine line */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

          <div className="relative z-10">
            <div className={cn(
              'rounded-2xl bg-gradient-to-br from-coral/15 to-coral/5 flex items-center justify-center mb-5 border border-coral/10',
              size === 'large' ? 'w-16 h-16' : 'w-12 h-12'
            )}>
              <Icon className={cn('text-coral', size === 'large' ? 'h-8 w-8' : 'h-6 w-6')} />
            </div>
            <h3 className={cn(
              'font-bold text-foreground mb-2',
              size === 'large' ? 'text-xl md:text-2xl' : 'text-lg'
            )}>
              {title}
            </h3>
            <p className={cn(
              'text-muted-foreground leading-relaxed',
              size === 'large' ? 'text-base' : 'text-sm'
            )}>
              {description}
            </p>
          </div>
        </motion.div>
      </RevealText>
    );
  }
);
