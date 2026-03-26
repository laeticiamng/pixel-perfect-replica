import { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface RevealTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

export const RevealText = forwardRef<HTMLDivElement, RevealTextProps>(
  function RevealText({ children, className = '', delay = 0 }, forwardedRef) {
    return (
      <motion.div
        ref={forwardedRef}
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        custom={delay}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);
