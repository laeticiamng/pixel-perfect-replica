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
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);
