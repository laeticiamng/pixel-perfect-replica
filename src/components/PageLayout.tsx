import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DesktopSidebar } from './navigation/DesktopSidebar';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  showOrbs?: boolean;
  animate?: boolean;
  showSidebar?: boolean;
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
  animate = true,
  showSidebar = true
}: PageLayoutProps) {
  const content = (
    <div className={cn(
      "min-h-screen min-h-[100dvh] bg-gradient-radial relative",
      // Use CSS variable for sidebar width to handle collapsed state gracefully
      showSidebar && "lg:pl-[72px] xl:pl-64 transition-all duration-300",
      className
    )}>
      {showOrbs && <FloatingOrbs />}
      {showSidebar && <DesktopSidebar />}
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

// Child item animation
const staggerItem = {
  hidden: { 
    opacity: 0, 
    y: 16,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

// Export for use in page components
export const AnimatedSection = ({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) => (
  <motion.div
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
);

export const AnimatedItem = ({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) => (
  <motion.div variants={staggerItem} className={className}>
    {children}
  </motion.div>
);

// Re-export animation variants for custom use
export { staggerContainer, staggerItem };
