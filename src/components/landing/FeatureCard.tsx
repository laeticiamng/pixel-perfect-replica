import { motion } from 'framer-motion';
import { RevealText } from './RevealText';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <RevealText delay={delay}>
      <motion.div 
        className="group relative p-6 rounded-3xl glass-strong border border-white/5 hover:border-coral/30 transition-all duration-500"
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-coral/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <span className="text-4xl mb-4 block">{icon}</span>
          <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </motion.div>
    </RevealText>
  );
}
