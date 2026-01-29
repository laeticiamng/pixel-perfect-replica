import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  showOrbs?: boolean;
  animate?: boolean;
}

// Floating orbs background - same as landing page
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-coral/20 rounded-full blur-[120px] animate-float" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-signal-green/15 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-coral/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: '4s' }} />
    </div>
  );
}

export function PageLayout({ 
  children, 
  className, 
  showOrbs = true,
  animate = true 
}: PageLayoutProps) {
  const content = (
    <div className={cn("min-h-screen min-h-[100dvh] bg-gradient-radial relative", className)}>
      {showOrbs && <FloatingOrbs />}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {content}
    </motion.div>
  );
}

// Stagger container for list animations
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Item animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

// Animated list container
export function AnimatedList({ 
  children, 
  className,
  delay = 0,
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated list item
export function AnimatedItem({ 
  children, 
  className,
  index = 0,
}: { 
  children: ReactNode; 
  className?: string;
  index?: number;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated section component for consistent page sections
export function AnimatedSection({ 
  children, 
  className, 
  delay = 0 
}: { 
  children: ReactNode; 
  className?: string; 
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated card with hover effect
export function AnimatedCard({ 
  children, 
  className,
  delay = 0,
  onClick
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.4, 0.25, 1] }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn("glass rounded-xl cursor-pointer", className)}
    >
      {children}
    </motion.div>
  );
}
