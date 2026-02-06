import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { RevealText } from './RevealText';
import { type LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  function FeatureCard({ icon: Icon, title, description, delay = 0 }, ref) {
    return (
      <RevealText delay={delay} ref={ref}>
        <motion.div 
          className="group relative p-6 rounded-3xl glass-strong border border-white/5 hover:border-coral/30 transition-all duration-500"
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-coral/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center mb-4">
              <Icon className="h-6 w-6 text-coral" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </motion.div>
      </RevealText>
    );
  }
);
