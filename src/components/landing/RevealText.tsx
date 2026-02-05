import { useRef, forwardRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface RevealTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const RevealText = forwardRef<HTMLDivElement, RevealTextProps>(
  function RevealText({ children, className = '', delay = 0 }, forwardedRef) {
    const internalRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(internalRef, { once: true, margin: "-100px" });
    
    return (
      <motion.div
        ref={(node) => {
          (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{ duration: 0.8, delay, ease: [0.25, 0.4, 0.25, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);
