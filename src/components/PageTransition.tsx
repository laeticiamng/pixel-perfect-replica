import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'default' | 'slide' | 'fade' | 'scale' | 'slideUp';
}

const variants = {
  default: {
    initial: {
      opacity: 0,
      y: 8,
      scale: 0.99,
    },
    enter: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      y: -8,
      scale: 0.99,
      transition: {
        duration: 0.2,
        ease: 'easeIn' as const,
      },
    },
  },
  slide: {
    initial: {
      opacity: 0,
      x: 20,
    },
    enter: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
        ease: 'easeIn' as const,
      },
    },
  },
  fade: {
    initial: {
      opacity: 0,
    },
    enter: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeIn' as const,
      },
    },
  },
  scale: {
    initial: {
      opacity: 0,
      scale: 0.95,
    },
    enter: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: 'easeIn' as const,
      },
    },
  },
  slideUp: {
    initial: {
      opacity: 0,
      y: 30,
    },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      y: -15,
      transition: {
        duration: 0.2,
        ease: 'easeIn' as const,
      },
    },
  },
};

export function PageTransition({ children, variant = 'default' }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={variants[variant]}
        className="min-h-screen will-change-transform"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Stagger children animation helper
export const staggerContainer = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

