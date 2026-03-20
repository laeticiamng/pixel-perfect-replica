import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AmbientLayer } from '@/experience';
import { DesktopSidebar } from './navigation/DesktopSidebar';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  showOrbs?: boolean;
  animate?: boolean;
  showSidebar?: boolean;
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
      // Sidebar is 256px (w-64) when expanded, must apply correct left padding
      showSidebar && "lg:pl-64",
      className
    )}>
      {showOrbs && <AmbientLayer />}
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
