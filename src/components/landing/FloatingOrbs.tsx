import { motion } from 'framer-motion';

export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Aurora mesh gradient - top */}
      <motion.div 
        animate={{ 
          x: [0, 30, -20, 0],
          y: [0, -20, 10, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-1/4 left-1/4 w-[800px] h-[600px] bg-coral/15 rounded-full blur-[150px]" 
      />
      
      {/* Purple accent - mid right */}
      <motion.div
        animate={{ 
          x: [0, -40, 20, 0],
          y: [0, 30, -10, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full blur-[130px]"
        style={{ background: 'hsl(var(--purple-accent) / 0.12)' }}
      />
      
      {/* Green accent - bottom left */}
      <motion.div
        animate={{ 
          x: [0, 20, -30, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-signal-green/8 rounded-full blur-[120px]" 
      />

      {/* Subtle coral bottom */}
      <motion.div
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 left-1/3 w-[600px] h-[300px] bg-coral/8 rounded-full blur-[100px]" 
      />

      {/* Grid overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
