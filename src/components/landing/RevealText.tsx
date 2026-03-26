import { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface RevealTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const RevealText = forwardRef<HTMLDivElement, RevealTextProps>(
  function RevealText({ children, className = '', delay = 0 }, forwardedRef) {
    return (
      <motion.div
        ref={forwardedRef}
        initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);
