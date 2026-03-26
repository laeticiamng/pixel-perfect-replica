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
            'group relative overflow-hidden rounded-3xl border border-border/30 bg-card/30 backdrop-blur-xl transition-all duration-500 hover:border-coral/30 hover:bg-card/50',
            size === 'large' ? 'p-8 md:p-10' : 'p-6',
            className
          )}
          whileHover={{ y: -6, scale: 1.01 }}
          transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {/* Gradient hover overlay with radial effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-coral/10 via-coral/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* Inner border glow */}
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-px rounded-3xl bg-card/40 backdrop-blur-xl" />
          </div>
          
          {/* Top shine line — animated on hover */}
          <div className="absolute top-0 left-0 right-0 h-px">
            <div className="h-full bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-coral/30 to-transparent opacity-0 group-hover:opacity-100"
              initial={false}
            />
          </div>

          <div className="relative z-10">
            <div className={cn(
              'rounded-2xl bg-gradient-to-br from-coral/15 to-coral/5 flex items-center justify-center mb-5 border border-coral/10 group-hover:border-coral/25 group-hover:shadow-lg group-hover:shadow-coral/10 transition-all duration-500',
              size === 'large' ? 'w-16 h-16' : 'w-12 h-12'
            )}>
              <Icon className={cn('text-coral transition-transform duration-500 group-hover:scale-110', size === 'large' ? 'h-8 w-8' : 'h-6 w-6')} />
            </div>
            <h3 className={cn(
              'font-bold text-foreground mb-2 transition-colors duration-300',
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
